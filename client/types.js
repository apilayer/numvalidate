/* @flow */
export type ApiToken = {
  value: string,
  name: ?string,
  createdAt: number,
  updatedAt: number,
};

export type Subscription = {
  planId: string,
  createdAt: string,
  updatedAt: string,
};

export type CreditCard = {
  addressZip: string,
  brand: string,
  country: string,
  expMonth: number,
  expYear: number,
  last4: string,
  createdAt: number,
  updatedAt: number,
};

export type User = {
  id: string,
  email: string,
  initialized: boolean,
  apiTokens: ApiToken[],
  subscription: Subscription,
  creditCard?: CreditCard,
};
