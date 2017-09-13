const commonUtils = require('../utils/common');
const auth0Service = require('../services/auth0');

module.exports = async (ctx, next) => {
  if (ctx.app.auth0Token && !commonUtils.isJwtTokenExpired(ctx.app.auth0Token)) {
    return await next();
  }
  console.info('Generating a new Auth0 token');
  const auth0Token = await auth0Service.generateAccessToken();
  console.info('New Auth0 token generated successfully');
  ctx.app.auth0Token = auth0Token;
  return next();
};
