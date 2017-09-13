module.exports = async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-App-Api-Token');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
    return;
  }
  return next();
};
