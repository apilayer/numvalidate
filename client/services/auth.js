/* @flow */
import Auth0 from 'auth0-js';
import Cookie from 'js-cookie';
import keys from '../config/keys';

const ACCESS_TOKEN_COOKIE_NAME = 'numvalidateAccessToken';

let auth0WebAuth;

const initialize = () => {
  auth0WebAuth = new Auth0.WebAuth({
    domain: keys.AUTH0_DOMAIN,
    clientID: keys.AUTH0_CLIENT_ID,
    redirectUri: `${window.location.origin}/dashboard`,
    audience: keys.AUTH0_AUDIENCE,
    responseType: 'token id_token',
    scope: 'openid',
  });
};

const setAuthCookie = (accessToken: string, tokenExpiresIn: number) => {
  if (!process.browser) {
    return;
  }
  const cookieExpiry = new Date(new Date().getTime() + tokenExpiresIn * 1000);
  Cookie.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, { expires: cookieExpiry });
};

const removeAuthCookie = () => {
  if (!process.browser) {
    return;
  }
  Cookie.remove(ACCESS_TOKEN_COOKIE_NAME);
};

const authorize = () => {
  auth0WebAuth.authorize();
};

const logout = () => {
  if (!process.browser) {
    return;
  }
  removeAuthCookie();
  window.localStorage.setItem('loggedOutAt', Date.now());
};

const getAccessToken = (req?: any): ?string => {
  if (process.browser) {
    return Cookie.getJSON(ACCESS_TOKEN_COOKIE_NAME);
  } else {
    if (!req || !req.headers || !req.headers.cookie) {
      return undefined;
    }
    const accessTokenCookie = req.headers.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith(`${ACCESS_TOKEN_COOKIE_NAME}=`));
    if (!accessTokenCookie) {
      return undefined;
    }
    return accessTokenCookie.split('=')[1];
  }
};

const isAuthenticated = (req?: any): boolean => {
  return getAccessToken(req) !== undefined;
};

const parseHash = async (): Promise<?string> => {
  return new Promise((resolve, reject) => {
    auth0WebAuth.parseHash(window.location.hash, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.expiresIn) {
        setAuthCookie(authResult.accessToken, authResult.expiresIn);
        return resolve(authResult.accessToken);
      } else if (err) {
        return reject(err);
      } else {
        if (isAuthenticated()) {
          return resolve();
        } else {
          return reject(`authResult: ${authResult}`);
        }
      }
    });
  });
};

export default {
  authorize,
  parseHash,
  logout,
  getAccessToken,
  isAuthenticated,
  initialize,
};
