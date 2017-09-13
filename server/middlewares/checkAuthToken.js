const jwt = require('koa-jwt');
const { koaJwtSecret } = require('jwks-rsa');
const keys = require('../config/keys');

module.exports = async (ctx, next) => {
  const jwtMiddleware = await jwt({
    secret: koaJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: keys.AUTH0_JWKS_URI,
    }),
    audience: keys.AUTH0_AUDIENCE,
    issuer: keys.AUTH0_ISSUER,
    algorithms: ['RS256'],
  });
  return await jwtMiddleware(ctx, next);
};
