// @flow
import keys from '../config/keys';

const BACKEND_API_BASE_URL = keys.PUBLIC_URL;

let accessToken = null;

const initialize = (token: string) => {
  accessToken = token;
};

const callBackendEndpoint = async (method: any, endpoint: string, body: ?Object) => {
  if (!accessToken) {
    throw new Error('No access token found');
  }
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  const url = `${BACKEND_API_BASE_URL}${endpoint}`;
  const stringifiedBody =
    method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(body || {});
  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: stringifiedBody,
  });
  const responseBody = await response.json();
  if (!response.ok || responseBody.error) {
    const error = responseBody.error || {};
    throw new Error(error.message || response.statusText || 'Connection error');
  }
  return responseBody;
};

const getUser = async () => {
  const res = await callBackendEndpoint('GET', '/user');
  return res.data;
};

const getPlans = async () => {
  const res = await callBackendEndpoint('GET', '/plans');
  return res.data;
};

const createUserCustomer = async () => {
  const res = await callBackendEndpoint('POST', '/user/customer');
  return res.data;
};

const createUserApiToken = async (tokenName: string) => {
  const res = await callBackendEndpoint('POST', '/user/token', { tokenName });
  return res.data;
};

const deleteUserApiToken = async (tokenValue: string) => {
  const res = await callBackendEndpoint('DELETE', `/user/token/${tokenValue}`);
  return res.data;
};

const updateUserSubscription = async (planId: string, stripeSource?: string) => {
  const res = await callBackendEndpoint('PATCH', '/user/subscription', {
    planId: planId,
    stripeSource,
  });
  return res.data;
};

const updateUserPaymentInfo = async (stripeToken: string) => {
  const res = await callBackendEndpoint('PATCH', '/user/source', {
    stripeSource: stripeToken,
  });
  return res.data;
};

export default {
  initialize,
  getUser,
  getPlans,
  createUserApiToken,
  deleteUserApiToken,
  updateUserSubscription,
  updateUserPaymentInfo,
  createUserCustomer,
};
