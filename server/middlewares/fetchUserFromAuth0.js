const auth0Service = require('../services/auth0');

module.exports = async (ctx, next) => {
  const { auth0Token } = ctx.app;
  const userId = ctx.state.user.sub;
  const user = await auth0Service.getUserById(auth0Token, userId);
  if (!user) {
    ctx.throw(404, 'User not found.');
  }
  ctx.state.auth0User = user;
  return next();
};
