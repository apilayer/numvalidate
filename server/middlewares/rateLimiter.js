/**
 * Docs: https://github.com/koajs/ratelimit/blob/master/index.js
 */
const RateLimiter = require('ratelimiter');
const ms = require('ms');
const redisService = require('../services/redis');
const commonUtils = require('../utils/common');
const keys = require('../config/keys');

module.exports = async (ctx, next) => {
  let id;
  if (ctx.state.apiToken) {
    id = `user_id:${ctx.state.userId}`;
  } else {
    id = `ip:${ctx.state.ipAddress}`;
  }

  const limiter = new RateLimiter(
    Object.assign({
      db: redisService.getRedis(),
      id: id, // the identifier to limit against (api token or IP)
      duration: keys.API_REQUESTS_EXPIRY_IN_MS, // duration of limit in milliseconds
      max: ctx.state.clientRequestsLimit, // max requests within duration
    })
  );

  const limit = await commonUtils.promisify(limiter.get.bind(limiter));

  const remaining = limit.remaining > 0 ? limit.remaining - 1 : 0;
  const reset = limit.reset;
  const total = limit.total;
  const headers = {
    'X-RateLimit-Remaining': remaining,
    'X-RateLimit-Reset': reset,
    'X-RateLimit-Limit': total,
  };

  ctx.set(headers);
  console.info('Request by %s', id);
  console.info('Remaining requests: %s/%s (reset at %s)', remaining, total, Date(reset));

  if (limit.remaining) {
    return await next();
  }

  const delta = (limit.reset * 1000 - Date.now()) | 0;
  const after = (limit.reset - Date.now() / 1000) | 0;
  ctx.set('Retry-After', after);

  ctx.status = 429;
  ctx.body = `Rate limit exceeded, retry in ${ms(delta, { long: true })}.`;

  ctx.throw(ctx.status, ctx.body, { headers: headers });
};
