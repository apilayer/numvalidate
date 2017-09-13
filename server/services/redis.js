const Redis = require('ioredis');
const keys = require('../config/keys');

const redis = new Redis(keys.REDIS_URL);

exports.getRedis = () => {
  return redis;
};

exports.getMaxRequestsByUserId = async userId => {
  const key = `user_id_to_max_requests:${userId}`;
  const result = await redis.get(key);
  return result;
};

exports.setUserMaxRequests = async (userId, maxRequests) => {
  const key = `user_id_to_max_requests:${userId}`;
  const result = await redis.set(key, maxRequests, 'EX', keys.REDIS_CACHE_EXPIRY_IN_MS);
  return result;
};

exports.getUserIdByApiToken = async apiToken => {
  const key = `token_to_user_id:${apiToken}`;
  const result = await redis.get(key);
  return result;
};

exports.setApiToken = async (apiToken, userId) => {
  const key = `token_to_user_id:${apiToken}`;
  const result = await redis.set(key, userId, 'EX', keys.REDIS_CACHE_EXPIRY_IN_MS);
  return result;
};

exports.removeUserCache = async (userId, apiTokens) => {
  // TODO: CHECK
  const limitKey = `limit:${userId}`;
  await redis.del(limitKey);
  const maxKey = `user_id_to_max_requests:${userId}`;
  await redis.del(maxKey);
  if (apiTokens && Array.isArray(apiTokens)) {
    for (const apiToken of apiTokens) {
      const tokenKey = `token_to_user_id:${apiToken}`;
      await redis.del(tokenKey);
    }
  }
};
