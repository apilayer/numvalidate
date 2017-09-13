const _ = require('lodash');

module.exports = async (ctx, next) => {
  let ipAddress;
  const headerForwardedTo = ctx.req.headers['x-forwarded-for'];
  if (headerForwardedTo) {
    ipAddress = _.last(headerForwardedTo.split(','));
  } else {
    ipAddress = ctx.ip;
  }
  ctx.state.ipAddress = ipAddress;
  return next();
};
