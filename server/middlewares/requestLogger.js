const uuid = require('uuid');
const chalk = require('chalk');
const _ = require('lodash');
const keys = require('../config/keys');
const logger = require('../utils/logger');
const sentryService = require('../services/sentry');

const STATUS_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
};

const REQUEST_WHITE_LIST = [
  'url',
  'headers',
  'method',
  'ip',
  'protocol',
  'originalUrl',
  'query',
  'body',
  'cookies',
  'query_string',
];

const BODY_BLACK_LIST = ['password'];

const levelFromStatus = status => {
  switch (true) {
    case status >= 500:
      return 'error';
    case status >= 400:
      return 'warn';
    case status >= 100:
      return 'info';
    default:
      return 'error';
  }
};

const filterObject = (originalObj, whiteList, bodyBlacklist) => {
  const newObj = _.pick(originalObj, whiteList);
  if (newObj.body) {
    newObj.body = _.omit(newObj.body, bodyBlacklist);
  }
  return newObj;
};

module.exports = async (ctx, next) => {
  if (!ctx.originalUrl.startsWith('/api') && !ctx.originalUrl.startsWith('/user')) {
    return await next();
  }
  const start = new Date();
  ctx.uuid = uuid.v4();

  await next();

  ctx.responseTime = new Date() - start;

  const level = levelFromStatus(ctx.status);

  const msg =
    chalk.gray(`${ctx.method} ${ctx.originalUrl}`) +
    chalk[STATUS_COLORS[level]](` ${ctx.status} `) +
    chalk.gray(`${ctx.responseTime}ms `) +
    chalk.red(_.get(ctx, 'body.error.message', ''));

  logger[level](msg);

  if (keys.SENTRY_DNS && ctx.status >= 400) {
    const sentryMsg = `${ctx.status} ${ctx.method} ${ctx.originalUrl} ${_.get(
      ctx,
      'body.error.message',
      ''
    )}`;
    const user = {
      id: _.get(ctx.state, 'auth0User.user_id') || _.get(ctx.state, 'userId'),
      username: _.get(ctx.state, 'apiToken') || _.get(ctx.state, 'ipAddress'),
      email: _.get(ctx.state, 'auth0User.email'),
    };
    const meta = {
      req: _.get(sentryService.parseRequest(ctx.request), 'request', undefined),
      level: ctx.status >= 500 ? 'error' : 'warning',
      user: user,
      extra: {
        user: user,
        id: ctx.uuid,
        timestamp: new Date(),
        method: ctx.method,
        originalUrl: ctx.originalUrl,
        status: ctx.status,
        responseTime: ctx.responseTime,
        req: filterObject(ctx.request, REQUEST_WHITE_LIST, BODY_BLACK_LIST),
        ipAddress: _.get(ctx.state, 'ipAddress'),
        clientRequestsLimit: _.get(ctx.state, 'clientRequestsLimit'),
        stack: _.get(ctx.state, 'error.stack'),
        message: _.get('ctx.body.error.message') || _.get(ctx.state, 'error.message'),
      },
    };
    sentryService.log(sentryMsg, meta);
  }
};
