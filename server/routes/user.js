const _ = require('lodash');
const commonUtils = require('../utils/common');
const auth0Service = require('../services/auth0');
const redisService = require('../services/redis');
const stripeService = require('../services/stripe');
const keys = require('../config/keys');

const normalizeUser = user => {
  const appMetadata = user.app_metadata || {};
  const apiTokens = appMetadata.api_tokens || {};
  const stripeSubscription = appMetadata.stripe_subscription || {};
  const stripeSource = appMetadata.stripe_source || {};
  return {
    id: user.user_id,
    email: user.email,
    initialized: appMetadata.initialized,
    apiTokens: Object.values(apiTokens).map(apiToken => ({
      value: apiToken.value,
      name: apiToken.name,
      createdAt: apiToken.created_at,
    })),
    subscription: {
      planId: stripeSubscription.plan_id,
      createdAt: stripeSubscription.created_at,
      updatedAt: stripeSubscription.updated_at,
    },
    creditCard: {
      addressZip: stripeSource.address_zip,
      brand: stripeSource.brand,
      country: stripeSource.country,
      expMonth: stripeSource.exp_month,
      expYear: stripeSource.exp_year,
      last4: stripeSource.last4,
      createdAt: stripeSource.created_at,
    },
  };
};

/**
 * GET /user
 * 
 * Gets the authenticated user.
 * @return {User} The authenticated user.
 */
exports.getUser = async ctx => {
  const user = ctx.state.auth0User;
  ctx.body = { data: normalizeUser(user) };
};

/**
 * POST /user/customer
 * 
 * Creates a Stripe customer and subscribe the user to the free tier.
 * @return {User} The updated user.
 */
exports.createUserCustomer = async ctx => {
  const { auth0Token } = ctx.app;
  const user = ctx.state.auth0User;
  const userId = user.user_id;
  const userAppMetadata = user.app_metadata || {};
  if (userAppMetadata.initialized) {
    ctx.throw(409, 'User has already been activated');
  }
  const currentDate = Date.now();
  const stripeCustomer = await stripeService.createCustomer({
    email: user.email,
  });
  const stripePlans = await stripeService.fetchPlans();
  const freePlan = stripePlans.data.find(x => x.amount === 0);
  const stripeSubscription = await stripeService.createSubscription({
    customer: stripeCustomer.id,
    plan: freePlan.id,
  });
  const apiToken = commonUtils.generateApiToken();
  const newAppMetadata = {
    initialized: true,
    stripe_customer: {
      id: stripeCustomer.id,
      created_at: currentDate,
      updated_at: currentDate,
    },
    stripe_subscription: {
      id: stripeSubscription.id,
      plan_id: freePlan.id,
      created_at: currentDate,
      updated_at: currentDate,
    },
    api_tokens: {
      [apiToken]: {
        value: apiToken,
        created_at: currentDate,
        name: 'Default',
      },
    },
  };
  const updatedUser = await auth0Service.updateUserAppMetadata(auth0Token, userId, newAppMetadata);
  ctx.body = { data: normalizeUser(updatedUser) };
};

/**
 * POST /user/token
 * 
 * Generates a new API token for the authenticated user.
 * @param {String} tokenName The token name.
 * @return {User} The updated user.
 */
exports.createUserApiToken = async ctx => {
  const { auth0Token } = ctx.app;
  ctx
    .validateBody('tokenName')
    .required()
    .isString();
  const { tokenName } = ctx.vals;
  const user = ctx.state.auth0User;
  const userId = user.user_id;
  const userAppMetadata = user.app_metadata || {};
  const apiToken = commonUtils.generateApiToken();
  const previousApiTokens = userAppMetadata.api_tokens;
  if (Object.keys(previousApiTokens).length >= keys.MAX_API_TOKENS_PER_USER) {
    ctx.throw('Maximum number of available tokens reached.');
  }
  const currentDate = Date.now();
  const newAppMetadata = {
    api_tokens: Object.assign(previousApiTokens, {
      [apiToken]: {
        value: apiToken,
        created_at: currentDate,
        name: tokenName,
      },
    }),
  };
  const updatedUser = await auth0Service.updateUserAppMetadata(auth0Token, userId, newAppMetadata);
  await redisService.removeUserCache(userId, Object.keys(previousApiTokens));
  ctx.body = { data: normalizeUser(updatedUser) };
};

/**
 * DELETE /user/token
 * 
 * Deletes an user API token.
 * @param {String} tokenValue The token value.
 * @return {User} The updated user.
 */
exports.deleteUserApiToken = async ctx => {
  const { auth0Token } = ctx.app;
  ctx
    .validateParam('tokenValue')
    .required()
    .isString();
  const { tokenValue } = ctx.vals;
  const user = ctx.state.auth0User;
  const userId = user.user_id;
  const userAppMetadata = user.app_metadata || {};
  if (!userAppMetadata.api_tokens || !userAppMetadata.api_tokens[tokenValue]) {
    ctx.throw(404, 'Token not found');
  }
  const previousApiTokens = userAppMetadata.api_tokens;
  const newAppMetadata = {
    api_tokens: _.omit(previousApiTokens, tokenValue),
  };
  const updatedUser = await auth0Service.updateUserAppMetadata(auth0Token, userId, newAppMetadata);
  await redisService.removeUserCache(userId, Object.keys(previousApiTokens));
  ctx.body = { data: normalizeUser(updatedUser) };
};

/**
 * PATCH /user/subscription
 * 
 * Updates the user subscription plan.
 * @param {String} planId The new payment plan.
 * @param {String} stripeSource The Stripe source token generated client side by 
 *        the checkout form (must be provided only for paid plans).
 * @return {User} The updated user.
 */
exports.updateUserSubscription = async ctx => {
  const { auth0Token } = ctx.app;
  const stripePlans = await stripeService.fetchPlans();
  ctx
    .validateBody('planId')
    .required()
    .checkPred(id => stripePlans.data.find(x => x.id === id));
  ctx
    .validateBody('stripeSource')
    .optional()
    .isString();
  const { planId, stripeSource } = ctx.vals;
  const user = ctx.state.auth0User;
  const userId = user.user_id;
  const userAppMetadata = user.app_metadata || {};
  const currentDate = Date.now();
  if (userAppMetadata.stripe_subscription.plan_id === planId) {
    ctx.throw(409, 'User already has this active subscription');
  }
  const freePlan = stripePlans.data.find(x => x.amount === 0);
  const requireCreditCard = planId !== freePlan.id;
  if (userAppMetadata.stripe_subscription.plan_id === planId) {
    ctx.throw(409, 'User already has this active subscription');
  }
  if (requireCreditCard && !stripeSource) {
    ctx.throw(400, 'The selected plan needs a valid credit card');
  }
  let newAppMetadata = {};
  if (requireCreditCard && stripeSource) {
    const stripeCustomerId = userAppMetadata.stripe_customer.id;
    const updatedStripeCustomer = await stripeService.updateCustomer(stripeCustomerId, {
      source: stripeSource,
    });
    const stripeCustomerCard = updatedStripeCustomer.sources.data[0];
    const previousStripeCustomer = userAppMetadata.stripe_customer;
    newAppMetadata.stripe_customer = Object.assign(previousStripeCustomer, {
      updated_at: currentDate,
    });
    newAppMetadata.stripe_source = {
      updated_at: currentDate,
      id: stripeCustomerCard.id,
      address_zip: stripeCustomerCard.address_zip,
      brand: stripeCustomerCard.brand,
      country: stripeCustomerCard.country,
      exp_month: stripeCustomerCard.exp_month,
      exp_year: stripeCustomerCard.exp_year,
      last4: stripeCustomerCard.last4,
      created_at: currentDate,
    };
  }
  const stripeSubscriptionId = userAppMetadata.stripe_subscription.id;
  await stripeService.updateSubscription(stripeSubscriptionId, {
    plan: planId,
  });
  const previousApiTokens = userAppMetadata.api_tokens;
  const previousStripeSubscription = userAppMetadata.stripe_subscription;
  newAppMetadata.stripe_subscription = Object.assign(previousStripeSubscription, {
    plan_id: planId,
    updated_at: currentDate,
  });
  const updatedUser = await auth0Service.updateUserAppMetadata(auth0Token, userId, newAppMetadata);
  if (previousApiTokens && freePlan) {
    await redisService.removeUserCache(userId, Object.keys(previousApiTokens));
  }
  ctx.body = { data: normalizeUser(updatedUser) };
};

/**
 * PATCH /user/source
 * 
 * Updates the user payment info (credit card details).
 * @param {String} stripeSource The Stripe source token generated client side by 
 *        the checkout form.
 * @return {User} The updated user.
 */
exports.updateUserSource = async ctx => {
  const { auth0Token } = ctx.app;
  ctx
    .validateBody('stripeSource')
    .required()
    .isString();
  const { stripeSource } = ctx.vals;
  const user = ctx.state.auth0User;
  const userId = user.user_id;
  const userAppMetadata = user.app_metadata || {};
  const currentDate = Date.now();
  const stripeCustomerId = userAppMetadata.stripe_customer.id;
  const updatedStripeCustomer = await stripeService.updateCustomer(stripeCustomerId, {
    source: stripeSource,
  });
  const stripeCustomerCard = updatedStripeCustomer.sources.data[0];
  const previousStripeCustomer = userAppMetadata.stripe_customer;
  const newAppMetadata = {
    stripe_customer: Object.assign(previousStripeCustomer, {
      updated_at: currentDate,
    }),
    stripe_source: {
      updated_at: currentDate,
      id: stripeCustomerCard.id,
      address_zip: stripeCustomerCard.address_zip,
      brand: stripeCustomerCard.brand,
      country: stripeCustomerCard.country,
      exp_month: stripeCustomerCard.exp_month,
      exp_year: stripeCustomerCard.exp_year,
      last4: stripeCustomerCard.last4,
      created_at: currentDate,
    },
  };
  const updatedUser = await auth0Service.updateUserAppMetadata(auth0Token, userId, newAppMetadata);
  ctx.body = { data: normalizeUser(updatedUser) };
};
