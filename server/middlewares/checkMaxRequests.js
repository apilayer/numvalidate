const _ = require('lodash');
const auth0Service = require('../services/auth0');
const redisService = require('../services/redis');
const stripeService = require('../services/stripe');
const keys = require('../config/keys');

module.exports = async (ctx, next) => {
  if (!ctx.state.apiToken) {
    ctx.state.clientRequestsLimit = keys.RATE_LIMIT_FOR_UNAUTHENTICATED_REQUESTS;
  } else {
    const userId = ctx.state.userId;
    const cachedMaxRequests = await redisService.getMaxRequestsByUserId(userId);
    console.log('Is daily usage limit cached? ', !_.isNil(cachedMaxRequests));
    if (!_.isNil(cachedMaxRequests)) {
      ctx.state.clientRequestsLimit = cachedMaxRequests;
      return next();
    } else {
      const auth0User = await auth0Service.getUserById(ctx.app.auth0Token, userId);
      const customerId = auth0User.app_metadata.stripe_customer.id;
      const stripeCustomer = await stripeService.fetchCustomer(customerId);
      const currentSubscriptionPlanId = stripeService.getCurrentSubscriptionPlanId(stripeCustomer);
      const isCurrentSubscriptionActive = stripeService.isCurrentSubscriptionActive(stripeCustomer);
      let maxRequests;
      const isFreePlan =
        currentSubscriptionPlanId && currentSubscriptionPlanId === keys.STRIPE_FREE_PLAN_ID;
      const isPaidPlan =
        currentSubscriptionPlanId && currentSubscriptionPlanId === keys.STRIPE_PRO_PLAN_ID;
      if (!isCurrentSubscriptionActive) {
        maxRequests = keys.RATE_LIMIT_FOR_FREE_USER_REQUESTS;
      } else if (isFreePlan) {
        maxRequests = keys.RATE_LIMIT_FOR_FREE_USER_REQUESTS;
      } else if (isPaidPlan) {
        maxRequests = keys.RATE_LIMIT_FOR_PRO_USER_REQUESTS;
      } else {
        ctx.throw(500, `Invalid subscription plan id: ${currentSubscriptionPlanId}`);
      }
      await redisService.setUserMaxRequests(userId, maxRequests);
      ctx.state.clientRequestsLimit = maxRequests;
    }
  }
  console.log('Daily usage limit: ', ctx.state.clientRequestsLimit);
  return next();
};
