const _ = require('lodash');
const commonUtils = require('../utils/common');
const redisService = require('../services/redis');
const auth0Service = require('../services/auth0');

module.exports = async (ctx, next) => {
  const apiTokenHeader = commonUtils.getObjectKey(ctx.headers, 'x-api-token');
  console.info('Has API token? ', apiTokenHeader !== undefined);
  if (!apiTokenHeader) {
    console.info('Missing API token');
    return next();
  }
  const apiToken = ctx.headers[apiTokenHeader];
  console.info('API token? ', apiToken);
  if (!commonUtils.isApiTokenValid(apiToken)) {
    console.info('Invalid API token');
    ctx.throw(400, 'Invalid API token');
  }
  let userId = await redisService.getUserIdByApiToken(apiToken);
  const isApiTokenCached = !_.isNil(userId);
  console.info('Is API token cached? ', isApiTokenCached);
  if (!isApiTokenCached) {
    const user = await auth0Service.getUserByApiToken(ctx.app.auth0Token, apiToken);
    console.info('Is API token assigned to an user? ', user !== undefined);
    if (!user) {
      ctx.throw(400, 'Invalid API token');
    }
    userId = user.user_id;
    await redisService.setApiToken(apiToken, userId);
  }
  console.info('User id: ', userId);
  ctx.state.apiToken = apiToken;
  ctx.state.userId = userId;
  return next();
};
