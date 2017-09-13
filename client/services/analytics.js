/* @flow */
import ReactGA from 'react-ga';
import keys from '../config/keys';

type EventParams = {
  category?: string,
  action?: string,
  label?: string,
  value?: number,
  nonInteraction?: boolean,
  transport?: string,
};

// $FlowFixMe
const isAnalyticsEnabled = keys.GOOGLE_ANALYTICS_TRACKING_ID && process.browser;

const initialize = () => {
  if (!isAnalyticsEnabled) return;
  ReactGA.initialize(keys.GOOGLE_ANALYTICS_TRACKING_ID);
};

const pageView = () => {
  if (!isAnalyticsEnabled) return;
  const page = `${window.location.pathname}${window.location.search}`;
  ReactGA.set({ page: page });
  ReactGA.pageview(page);
};

const event = (eventParams: EventParams) => {
  if (!isAnalyticsEnabled) return;
  ReactGA.event(eventParams);
};

export default {
  initialize,
  pageView,
  event,
};
