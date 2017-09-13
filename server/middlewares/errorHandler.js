const koaBouncer = require('koa-bouncer');
const isNumber = require('lodash').isNumber;

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.type = 'application/json';
    ctx.body = {};
    if (err instanceof koaBouncer.ValidationError) {
      ctx.status = 422;
      ctx.body.error = {
        message: err.message || 'Validation error',
        status: 422,
      };
    } else {
      const status = isNumber(err.status) ? err.status : 500;
      ctx.state.error = err;
      ctx.status = status;
      ctx.body.error = {
        message: err.message || 'Internal server error',
        status: status,
      };
    }
  }
};
