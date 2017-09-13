module.exports = async (ctx, next) => {
  if (!ctx.state.auth0User.app_metadata.stripe_customer.id) {
    ctx.throw(400, 'User not activated yet.');
  }
  return next();
};
