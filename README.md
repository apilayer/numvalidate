

&nbsp;

# NumValidate  <img src="./.github/logo-rounded.png" width="110" align="left">
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

&nbsp;

NumValidate is a phone validation REST API powered by Google LibPhoneNumber, a phone number formatting and parsing library released by Google, originally developed for (and currently used in) Google's Android mobile phone operating system, which uses several rigorous rules for parsing, formatting, and validating phone numbers for all countries/regions of the world.

NumValidate is open source, and in this repository you'll be able to find everything you'll need to setup your own NumValidate platform.  
&nbsp;

<p align="center" margin-bottom="0">
  <a href="https://numvalidate.com" target="_blank">
    <img alt="Numvalidate" width="auto" height="auto" src="./.github/website-screenshot.png">
  </a>
</p>
<p align="center">
  <a href="https://www.numvalidate.com">numvalidate.com</a>
</p>

## Overview


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
The client is a React application that exposes the **Home page** and the **Dashboard**, and both pages are rendered server-side thanks to Next. 

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

```javascript
server
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
 ├── config
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
 │   ├── common.js// Common utils used in all the app
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
To run this project you'll need an Auth0 account.
WIP.

### Stripe Setup
To run this project you'll need a Stripe account.
WIP.

### Setup

Run the app in dev mode (including *hot module reloading*) with:

```bash
npm install
npm run start-dev
```

To run in production mode:

`npm run build && npm start`

### Configuration  

This project makes an heave use of environment variables for its configuration, so, if you want to run the project locally, you are adviced to include a `.env.server` and a `env.client` file in your project root (I use two dotenv files instead of one to keep the things clearer while developing).  

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
| `STRIPE_FREE_PLAN_ID` | *REQUIRED* | Free plan ID in Stripe |
| `STRIPE_PRO_PLAN_ID` | *REQUIRED* | Pro plan ID in Stripe |
| `STRIPE_PUBLIC_KEY` | *REQUIRED* | Stripe API public key |
| `STRIPE_SECRET_KEY` | *REQUIRED* | Stripe API secret key |
| `PAPERTRAIL_HOST` | *OPTIONAL* | Papertrail URL |
| `PAPERTRAIL_PORT` | *OPTIONAL* | Papertrail port |
| `SENTRY_DSN` | *OPTIONAL* | Sentry DSN |


## Contributing
Pull requests are welcome. File an issue for ideas, conversation or feedback.

