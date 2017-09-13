const Koa = require('koa');
const bodyMiddleware = require('koa-body');
const helmetMiddleware = require('koa-helmet');
const koaBouncer = require('koa-bouncer');
const koaRouter = require('koa-router')();
const koaConnect = require('koa-connect');
const compression = require('compression');
const next = require('next');
const getIpAddressMiddleware = require('./middlewares/getIpAddress');
const loggerMiddleware = require('./middlewares/requestLogger');
const checkAuthTokenMiddleware = require('./middlewares/checkAuthToken');
const checkMaxRequestsMiddleware = require('./middlewares/checkMaxRequests');
const checkStripeCustomerMiddleware = require('./middlewares/checkStripeCustomer');
const fetchUserFromAuth0Middleware = require('./middlewares/fetchUserFromAuth0');
const auth0TokenGeneratorMiddleware = require('./middlewares/auth0TokenGenerator');
const errorHandlerMiddleware = require('./middlewares/errorHandler');
const allowCrossDomainMiddleware = require('./middlewares/allowCrossDomain');
const checkApiTokenMiddleware = require('./middlewares/checkApiToken');
const rateLimiterMiddleware = require('./middlewares/rateLimiter');
const userRoutes = require('./routes/user');
const apiRoutes = require('./routes/api');
const keys = require('./config/keys');

const app = new Koa();
const nextApp = next({ dev: keys.IS_ENV_DEVELOPMENT, dir: './client' });

app.poweredBy = false;

if (!keys.IS_ENV_TEST) {
  app.use(loggerMiddleware);
}
app.use(koaConnect(compression()));
app.use(helmetMiddleware());
app.use(allowCrossDomainMiddleware);
app.use(getIpAddressMiddleware);
app.use(errorHandlerMiddleware);
app.use(bodyMiddleware());
app.use(koaBouncer.middleware());
app.use(auth0TokenGeneratorMiddleware);

const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  koaRouter
    .get(
      '/api/validate',
      checkApiTokenMiddleware,
      checkMaxRequestsMiddleware,
      rateLimiterMiddleware,
      apiRoutes.validate
    )
    .get('/api/countries', checkApiTokenMiddleware, rateLimiterMiddleware, apiRoutes.getCountries)
    .get('/user', checkAuthTokenMiddleware, fetchUserFromAuth0Middleware, userRoutes.getUser)
    .post(
      '/user/customer',
      checkAuthTokenMiddleware,
      fetchUserFromAuth0Middleware,
      userRoutes.createUserCustomer
    )
    .post(
      '/user/token',
      checkAuthTokenMiddleware,
      fetchUserFromAuth0Middleware,
      userRoutes.createUserApiToken
    )
    .delete(
      '/user/token/:tokenValue',
      checkAuthTokenMiddleware,
      fetchUserFromAuth0Middleware,
      userRoutes.deleteUserApiToken
    )
    .patch(
      '/user/subscription',
      checkAuthTokenMiddleware,
      fetchUserFromAuth0Middleware,
      checkStripeCustomerMiddleware,
      userRoutes.updateUserSubscription
    )
    .patch(
      '/user/source',
      checkAuthTokenMiddleware,
      fetchUserFromAuth0Middleware,
      checkStripeCustomerMiddleware,
      userRoutes.updateUserSource
    )
    .get('/dashboard', async (ctx, next) => {
      ctx.res.statusCode = 200;
      await nextApp.render(ctx.req, ctx.res, '/Dashboard', ctx.query);
      ctx.respond = false;
    })
    .get('/', async (ctx, next) => {
      ctx.res.statusCode = 200;
      nextApp.render(ctx.req, ctx.res, '/Home', ctx.query);
      ctx.respond = false;
    })
    .get('*', async (ctx, next) => {
      ctx.res.statusCode = 200;
      await handle(ctx.req, ctx.res);
      ctx.respond = false;
    });

  app.use(koaRouter.routes());

  app.use(koaRouter.allowedMethods());
});
module.exports = app;
