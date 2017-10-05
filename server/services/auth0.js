const request = require('request-promise');
const keys = require('../config/keys');

const AUTH0_API_URL = `https://${keys.AUTH0_DOMAIN}/api/v2`;

exports.generateAccessToken = async () => {
  const response = await request({
    url: `https://${keys.AUTH0_DOMAIN}/oauth/token`,
    method: 'POST',
    json: true,
    body: {
      grant_type: 'client_credentials',
      client_id: keys.AUTH0_MANAGEMENT_API_CLIENT_ID,
      client_secret: keys.AUTH0_MANAGEMENT_API_CLIENT_SECRET,
      audience: keys.AUTH0_MANAGEMENT_API_AUDIENCE,
    },
    headers: { 'content-type': 'application/json' },
  });
  return response.access_token;
};

exports.getUserByApiToken = async (auth0Token, apiToken) => {
  const response = await request({
    url: `${AUTH0_API_URL}/users?q=_exists_:app_metadata.api_tokens.${apiToken}`,
    method: 'GET',
    json: true,
    headers: {
      authorization: `Bearer ${auth0Token}`,
      'content-type': 'application/json',
    },
  });
  return response && response.length > 0 ? response[0] : undefined;
};

exports.getUserById = async (auth0Token, userId) => {
  const response = await request({
    url: `${AUTH0_API_URL}/users/${userId}`,
    method: 'GET',
    json: true,
    headers: {
      authorization: `Bearer ${auth0Token}`,
      'content-type': 'application/json',
    },
  });
  return response && response.length > 0 ? response[0] : undefined;
};

exports.updateUserAppMetadata = async (auth0Token, userId, appMetadata) => {
  const response = await request({
    url: `${AUTH0_API_URL}/users/${userId}`,
    method: 'PATCH',
    json: true,
    headers: {
      authorization: `Bearer ${auth0Token}`,
      'content-type': 'application/json',
    },
    body: {
      app_metadata: appMetadata,
    },
  });
  return response;
};
