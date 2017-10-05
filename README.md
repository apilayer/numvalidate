

&nbsp;

# NumValidate  <img src="./.github/logo-rounded.png" width="110" align="left">
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

&nbsp;

NumValidate is a phone validation REST API powered by Google LibPhoneNumber, a phone number formatting and parsing library released by Google, originally developed for (and currently used in) Google's Android mobile phone operating system, which uses several rigorous rules for parsing, formatting, and validating phone numbers for all countries/regions of the world.

&nbsp;

<p align="center" margin-bottom="0">
  <a href="https://numvalidate.com" target="_blank">
    <img alt="Numvalidate" width="auto" height="auto" src="./.github/website-screenshot.png">
  </a>
</p>
<p align="center">
  <a href="https://numvalidate.com">numvalidate.com</a>
</p>

## Overview

In this repository you'll be able to find everything you'll need to setup your own NumValidate platform.  

Even if you're not interested in phone number validation, I suggest you to take a look around here, since **you can easily customize NumValidate to expose any kind of API you like**: the phone validation APIs consists in [> 200 line of codes](https://github.com/mmazzarolo/numvalidate/blob/master/server/routes/api.js), while the remaining code supports the authentication, authorization, plan subscription, plan payment and API tokens management.

### Features
- Plain simple phone number validation rest API, powered by [Google LibPhoneNumber](https://github.com/googlei18n/libphonenumber) and [documented](https://github.com/mmazzarolo/numvalidate-docs) with [Slate](https://github.com/lord/slate)
- Server-side rendered responsive React website/landing-page (~160kb GZipped) 
- Private API tokens generation and management for authenticated users through the Dashboard
- Fully featured authentication for accessing the Dashboard: email + password, Github and Google login thanks to [Auth0](https://auth0.com/)
- API requests with different rate limits for unauthenticated user, free user and pro user, updated in real time after a subscription change
- Secure payment for paid subscriptions handled by [Stripe](https://stripe.com): change your payment method at any given time
- API tokens cached with Redis for faster response time on consecutive requests
- Production ready logging and error reporting using Winston, [Sentry](https://sentry.io) and [Papertrail](https://papertrailapp.com/)

### Stack
- Node.js - (Web Server)
- React - (Website and dashboard UI)
- Next - (Routing, Server Side Rendering and code splitting)
- Koa - (Web App Server)
- Redis - (Caching)
- Flow - (Static Types in the Dashboard)
- ESLint - (JS Best Practices/Code Highlighting)

### External services and platforms
- [Auth0](https://auth0.com/) - (Authentication and authorization)
- [Stripe](https://stripe.com) - (Payment processing)
- [Papertrail](https://papertrailapp.com/) - (Log management)
- [Sentry](https://sentry.io) - (Error tracking and reporting)

## Architecture 

### The Client
The client is a React application that exposes the **Home page** and the **Dashboard**: both pages are rendered server-side thanks to Next. 
To take advantage of Next server-side rendering, the app follows the convention of grouping the main routes under the `/pages` directory and putting all the static assets under `statics`. 

The app itself is not a complex one: the *Home page* is just a simple page that emphasizes the product features, while the *Dashboard* (available after a successfull signup) is used for generating API tokens and updating the user subscription plan.  

I tried to mimic the structure promoted by `create-react-app` as much as possible (since I love it for smaller sites), so I use plain CSS to style the components (with a touch of CSS just for supporting CSS Custom Variables for color names) and I don't use bleeding edge stuff like decorators et similia.  
For the same reason, you won't find any state management library here, since `setState` has proven to be more than than enough for this project.

```javascript
client
 ├── components // The building blocks of the UI
 │   ├── Button.css 
 │   ├── Button.js
 │   ├── DashboardCreditCard.css
 │   ├── DashboardCreditCard.js
 │   └── ...
 │
 ├── config
 │   ├── keys.js // Constants used across the app (mostly are env vars)
 │   └── strings.js // Almost every string used in the Dashboard
 │
 ├── pages // The actual pages (aka containers) server by Next
 │   ├── Dashboard.css 
 │   ├── Dashboard.js
 │   ├── Home.css
 │   └── Home.js
 │
 ├── services
 │   ├── analytics.js // Simple wrapper over Google Analytics
 │   ├── auth.js // Auth0 APIs
 │   └── backend.js // Backend (server) APIs
 │
 ├── static // Static assets (favicons, images, robots.txt)
 │
 ├── utils // Common utils used in all the app
 │
 ├── colors.css // CSS colors variables
 │
 ├── globals.css // Global styles
 │
 ├── next.config // Babel config injected into Next
 │
 ├── postcss.config // PostCSS config injected into Next
 │
 └── types.js // Flowtype type definitions
```     

### The Server
The server is a Node application powered by Koa, responsible of handling all the API requests and rendering the website/dashboard.  
There is no database here: all the users info like the API tokens and the Stripe customer ID are stored in Auth0 in the user `appMetadata`. The endpoints defined in `routes/user.js` handles all the requests made by the Dashboard to manage the user info.  
To fetch and update the users info from Auth0 and validate the user JWT I use an [Auth0 API](https://auth0.com/docs/api/info) (defined in `services/auth0.js`) with granted permissions to many [Auth0 management API endpoints](https://auth0.com/docs/api/management/v2).  
The requests to the `/api` endpoints are rate limited by IP (for unauthenticated users) and by API token (for authenticated users). 

The most interesting part of the server is probably the API token rate limiting and caching, which grants a fast response time on consecutive requests. The flow is the following:
- An authenticated user makes a request to an `/api` endpoint with an `x-api-token` header.
- The API token is validated in `middlewares/checkApiToken.js`: 
  -  If the API token is not cached in Redis then the server searches for an user with that API token in Auth0 to check for its validity (and cache it)
  - If the API token is already cached in Redis, the Auth0 search is skipped
- The API token user's daily usage limit is checked in `middlewares/checkMaxRequests.js`:
  - If the daily usage limit of the user is not cached in Redis then the server searches for it (and cache it) by fetching the user subscription plan on Stripe 
  - If the daily usage limit of the user is cached in Redis, the Stripe fetch is skipped
- If the user reached its daily API requests limit then the server doesn't finalize the call to the `/api` endpoint and returns a `429` status code instead (`middlewares/rateLimited.js`).

The Redis cache expires after the milliseconds defined in the `REDIS_CACHE_EXPIRY_IN_MS` environment variable and after an user subscription plan change.  

```javascript
server
 ├── config
 │   ├── keys.js // Constants used across the app (mostly are env vars)
 │   └── strings.js // Almost every string used in the Dashboard
 │
 ├── middlewares
 │   ├── allowCrossDomain.js // CORS setup 
 │   ├── auth0TokenGenerator.js // Daily Auth0 Management API token generator 
 │   ├── checkApiToken.js // Validates the request API token
 │   ├── checkAuthToken.js // Validates the request Auth0 JWT 
 │   ├── checkMaxRequests.js // Checks the max requests limit of the user
 │   ├── checkStripeCustomer.js // Verifies that the user initialized in Stripe
 │   ├── errorHandler.js // Returns a clean response error 
 │   ├── fetchUserFromAuth0.js // Given the Auth0 JWT gets the user from Auth0 
 │   ├── getIpAddress.js // Gets the request IP address
 │   ├── rateLimiter.js // Blocks the request on max requests limit reached
 │   └── requestLogger.js // Logs the request on console/Papertrail/Sentry
 │
 ├── routes
 │   ├── api.js // Phone validation endpoints
 │   └── user.js // Dashboard endpoints
 │
 ├── services
 │   ├── auth0.js // Auth0 APIs wrapper
 │   ├── redis.js // Redis queries
 │   ├── sentry.js // Sentry APIs wrapper
 │   └── stripe.js // Stripe APIs wrapper
 │
 ├── static
 │   └── countries.json // Phone validation supported countries
 │
 ├── utils
 │   ├── common.js // Common utils used in all the app
 │   └── logger.js // Winston logger setup
 │
 ├── utils // Common utils used in all the app
 │
 ├── app.js // App setup
 │
 └── index.j // App entry point
```  

## How To Start The Application

### Auth0 Setup
To run this project you'll need an [Auth0](https://auth0.com/) account.  
Since this is a complex process, I'll detail it by using the naming convention I followed with NumValidate, by supposing that your app name is **"SuperApp"**

Please make sure all the items in the following checklist are marked before running this project in development:

- [ ] Create an account on [Auth0](https://auth0.com/) and head to the Auth0 [dashboard](https://manage.auth0.com/)
- [ ] Create a new tenant (which basically is a sub-account) that you'll use for development (by clicking on your icon in the top right corner and selecting **Create tenant**) and name it **"superapp-dev"**
- [ ] Create a new Single Page Application Client named **"SuperApp"**: it will be the used to signup/login users in Auth0
- [ ] In the created client detail, add to the **Allowed Callback URLs** the URL you'll redirect the user after a succesfull login
- [ ] Create a new API named **"SuperApp"**: it will be used to authenticate and authorize the Auth0 user to your server (by checking their JWT)
- [ ] Create a new client named **"SuperApp Management API Client"**: it will be used for calling the Auth0 Management APIs for fetching and updating user informations
- [ ] In Auth0 Management API details and in **Non Interactive Clients** enable your **Auths Management API client**
- [ ] Super boring stuff ahead: since some essential permissions are not enabled by default on the **SuperApp** client, you'll need to [add them manually by making an API call to the Auth0 Management API](https://community.auth0.com/questions/3944/error-grant-type-password-not-allowed-for-the-clie)


If you're ready for production, you'll need to replicate all the above stuff in a new tenant (named **superapp**) and also check the following:

- [ ] If you use any social integration (Google, Facebook, etc...) you'll need to provide your own API token/secrets for that integration
- [ ] Setup your own email service (Amazon Ses, Mandrill, etc...) for sending the Auth0 emails
- [ ] Customize the email templates to better suit your needs

I also suggest adding a custom rule for locking the user out of your app until it has not verified its email (it will still be able to access the app for the first day post-signup):
```javascript
function (user, context, callback) {
  var oneDayPostSignup = new Date(user.created_at).getTime() + (24 * 60 * 60 * 1000);
  if (!user.email_verified && new Date().getTime() > oneDayPostSignup) {
    return callback(new UnauthorizedError('Please verify your email before logging in.'));
  } else {
    return callback(null, user, context);
  }
}
```


### Stripe Setup
To run this project you'll need a [Stripe](https://stripe.com) account.

Please make sure all the items in the following checklist are marked before running this project in development:

- [ ] Create an account on [Stripe](https://stripe.com) and head to the Stripe [dashboard](https://dashboard.stripe.com/dashboard)
- [ ] Switch to the **test mode** by toggling the **View test data** button in the left sidebar
- [ ] Subscription -> Plans -> Create a new plan with a price of 0.00€/$: it will be your app free plan
- [ ] Subscription -> Plans -> Create a new plan with a price you like: it will be your app paid plan

If you're ready for production, you'll need to create the above subscription outside of the **test mode** too, and verify your business settings. 

### Setup

Run the app in dev mode (including *hot module reloading*) with:

```bash
npm install
npm run start-dev
```

To run in production mode:

`npm run build && npm start`

### Configuration  

This project makes an heavy use of environment variables for its configuration, so, if you want to run the project locally, you are adviced to include a `.env.server` and a `env.client` file in your project root (I use two dotenv files instead of one to keep the things clearer while developing).  

Client environment variables:  
  
| Environment Variable | Default | Description |
| ------------- | ------------- | ------------- |
| `REACT_APP_AUTH0_AUDIENCE` | *REQUIRED* | Auth0 audience |
| `REACT_APP_AUTH0_CLIENT_ID` | *REQUIRED* |  Auth0 ClientID |
| `REACT_APP_AUTH0_DOMAIN` | *REQUIRED* |  Auth0 domain |
| `REACT_APP_RATE_LIMIT_FOR_UNAUTHENTICATED_REQUESTS` | 100 | Rate limit for unauthenticated users |
| `REACT_APP_RATE_LIMIT_FOR_FREE_USER_REQUESTS` | 1000 | Rate limit for free users |
| `REACT_APP_RATE_LIMIT_FOR_PRO_USER_REQUESTS` | 100000 | Rate limit for pro users |
| `REACT_APP_STRIPE_FREE_PLAN_ID` | *REQUIRED* | Free plan ID in Stripe |
| `REACT_APP_STRIPE_PRO_PLAN_ID` | *REQUIRED* | Pro plan ID in Stripe |
| `REACT_APP_STRIPE_PRO_PLAN_AMOUNT` | 399 | The pro plan subscription amount in Stripe |
| `REACT_APP_STRIPE_PUBLIC_KEY` | *REQUIRED* | Stripe API public key |
| `REACT_APP_MAX_API_TOKENS_PER_USER` | 5 | The maximum number of API tokens per user |
| `REACT_APP_GOOGLE_SITE_VERIFICATION` | OPTIONAL | The Google Search Console verification key |

Server environment variables:  
  
| Environment Variable | Default | Description |
| ------------- | ------------- | ------------- |
| `PORT` | 1337| The port where the server will run |
| `AUTH0_AUDIENCE` | *REQUIRED* | Auth0 audience |
| `AUTH0_DOMAIN` | *REQUIRED* | Auth0 audience |
| `AUTH0_ISSUER` | *REQUIRED* | Auth0 audience |
| `AUTH0_JWKS_URI` | *REQUIRED* | Auth0 audience |
| `AUTH0_MANAGEMENT_API_AUDIENCE` | *REQUIRED* | Auth0 audience |
| `AUTH0_MANAGEMENT_API_CLIENT_ID` | *REQUIRED* | Auth0 audience |
| `AUTH0_MANAGEMENT_API_CLIENT_SECRET` | *REQUIRED* | Auth0 audience |
| `EXECUTION_ENV` | development | Used mainly for logging infos |
| `RATE_LIMIT_FOR_UNAUTHENTICATED_REQUESTS` | 100 | Rate limit for unauthenticated users |
| `RATE_LIMIT_FOR_FREE_USER_REQUESTS` | 1000 | Rate limit for free users |
| `RATE_LIMIT_FOR_PRO_USER_REQUESTS` | 100000 | Rate limit for pro users |
| `REDIS_URL` | *REQUIRED* | Redis URL |
| `REDIS_CACHE_EXPIRY_IN_MS` | ms('1d') | Expiration of Redis cache in milliseconds |
| `STRIPE_FREE_PLAN_ID` | *REQUIRED* | Free plan ID in Stripe |
| `STRIPE_PRO_PLAN_ID` | *REQUIRED* | Pro plan ID in Stripe |
| `STRIPE_PUBLIC_KEY` | *REQUIRED* | Stripe API public key |
| `STRIPE_SECRET_KEY` | *REQUIRED* | Stripe API secret key |
| `PAPERTRAIL_HOST` | *OPTIONAL* | Papertrail URL |
| `PAPERTRAIL_PORT` | *OPTIONAL* | Papertrail port |
| `SENTRY_DSN` | *OPTIONAL* | Sentry DSN |


## Contributing
Pull requests are welcome. File an issue for ideas, conversation or feedback.

