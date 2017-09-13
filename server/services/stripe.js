const _ = require('lodash');
const Stripe = require('stripe');
const keys = require('../config/keys');

const stripe = new Stripe(keys.STRIPE_SECRET_KEY);

exports.fetchPlans = async params => {
  const plans = stripe.plans.list();
  return plans;
};

exports.fetchCustomer = async customerId => {
  const customer = await stripe.customers.retrieve(customerId);
  return customer;
};

exports.createCustomer = async params => {
  const customer = await stripe.customers.create(params);
  return customer;
};

exports.updateCustomer = async (customerId, params) => {
  const customer = await stripe.customers.update(customerId, params);
  return customer;
};

exports.createSubscription = async params => {
  const subscription = await stripe.subscriptions.create(params);
  return subscription;
};

exports.updateSubscription = async (subscriptionId, params) => {
  const subscription = await stripe.subscriptions.update(subscriptionId, params);
  return subscription;
};

exports.getCurrentSubscriptionPlanId = stripeCustomer => {
  return _.get(stripeCustomer, 'subscriptions.data.[0].plan.id');
};

exports.isCurrentSubscriptionActive = stripeCustomer => {
  const status = _.get(stripeCustomer, 'subscriptions.data.[0].status');
  return status && status === 'active' ? true : false;
};
