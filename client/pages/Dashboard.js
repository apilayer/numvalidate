/* @flow */
import React, { Component } from 'react';
import _ from 'lodash';
import PageHead from '../components/PageHead';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Snackbar from '../components/Snackbar';
import Toolbar from '../components/Toolbar';
import backendService from '../services/backend';
import analyticsService from '../services/analytics';
import authService from '../services/auth';
import DashboardSubscription from '../components/DashboardSubscription';
import DashboardCreditCard from '../components/DashboardCreditCard';
import DashboardTokens from '../components/DashboardTokens';
import keys from '../config/keys';
import strings from '../config/strings';
import utils from '../utils';
import globalStyle from '../globals.css';
import style from './Dashboard.css';

import type { User } from '../types';

const SNACKBAR_AUTO_HIDE_DELAY_IN_MS = 4000;

type Props = {
  cookieAccessToken?: string,
};

type State = {
  initialized: boolean,
  initializationError?: string,
  emailVerified: boolean,
  authenticated: boolean,
  snackbarVisible: boolean,
  snackbarMessage: string,
  user?: User,
};

class Dashboard extends Component<void, Props, State> {
  static getInitialProps(ctx) {
    const cookieAccessToken = authService.getAccessToken(ctx.req);
    return { cookieAccessToken };
  }

  state = {
    initialized: false,
    initializationError: undefined,
    emailVerified: false,
    authenticated: false,
    snackbarVisible: false,
    snackbarMessage: '',
    user: undefined,
  };

  componentDidMount() {
    analyticsService.initialize();
    analyticsService.pageView();
    this._initialize();
  }

  _initialize = async () => {
    let error;
    // First, ensure that a token exists by checking the page url hash (if the
    // user has just completed a succesfull login you'll find here the token).
    // If the page url doesn't come from a succesfull login redirect, just use
    // the token saved in the cookie.
    let accessToken;
    try {
      accessToken = (await authService.parseHash()) || this.props.cookieAccessToken;
    } catch (err) {
      error = err;
    }
    if (!accessToken || error) {
      const auth0ErrorMessage = error && error.errorDescription;
      this.setState({
        initialized: true,
        authenticated: false,
        emailVerified: auth0ErrorMessage !== 'Please verify your email before logging in.',
        initializationError: auth0ErrorMessage || strings.DASHBOARD_ERROR_MESSAGE_GENERIC,
      });
      return;
    }
    // Then, initialize the backend service with the token and fetch for the
    // user infos.
    // Also, create a Stripe Customer for the user if needed.
    backendService.initialize(accessToken);
    let user;
    try {
      user = await backendService.getUser();
      if (!user.initialized) {
        user = await backendService.createUserCustomer();
      }
    } catch (err) {
      error = err;
    }
    if (!user || error) {
      this.setState({
        initialized: true,
        authenticated: false,
        initializationError: strings.DASHBOARD_ERROR_MESSAGE_GENERIC,
      });
      return;
    }
    // If everything was ok, save the user in the state
    this.setState({ initialized: true, authenticated: true, user: user });
  };

  _handleLogout = () => {
    authService.logout();
    window.location.replace(keys.PUBLIC_URL);
  };

  _handleToolbarTitleClick = () => {
    window.location.href = keys.PUBLIC_URL;
  };

  _handleErrorButtonClick = () => {
    authService.logout();
    window.location.replace(keys.PUBLIC_URL);
  };

  _showSnackbar = async (error: Error) => {
    console.log('error', error);
    this.setState({
      snackbarVisible: true,
      snackbarMessage: error.message || strings.SNACKBAR_TEXT,
    });
    await utils.delay(SNACKBAR_AUTO_HIDE_DELAY_IN_MS);
    this._hideSnackbar();
  };

  _hideSnackbar = () => {
    this.setState({ snackbarVisible: false });
  };

  _updateUser = (user: User) => {
    this.setState({ user: user });
  };

  render() {
    const { authenticated, snackbarVisible, snackbarMessage, initialized, user = {} } = this.state;

    if (!initialized) {
      return (
        <div className={'Dashboard'}>
          <PageHead title={'NumValidate - Dashboard'} />
          <style jsx global>
            {globalStyle}
          </style>
          <style jsx>{style}</style>
          <div className={'Dashboard-loading'}>
            <Spinner visible={true} />
          </div>
        </div>
      );
    } else if (!authenticated) {
      return (
        <div className={'Dashboard'}>
          <PageHead title={'NumValidate - Dashboard'} />
          <style jsx global>
            {globalStyle}
          </style>
          <style jsx>{style}</style>
          <div className={'Dashboard-error'}>
            <h1>{strings.DASHBOARD_ERROR_TITLE}</h1>
            <p>{this.state.initializationError}</p>
            <Button size={'big'} onClick={this._handleErrorButtonClick}>
              {strings.DASHBOARD_ERROR_BUTTON}
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={'Dashboard-container'}>
          <div className={'Dashboard'}>
            <PageHead title={'NumValidate - Dashboard'} />
            <style jsx global>
              {globalStyle}
            </style>
            <style jsx>{style}</style>
            <div className={'Dashboard-toolbar'}>
              <Toolbar onTitleClick={this._handleToolbarTitleClick}>
                <a href={keys.DOCS_URL}>{strings.DOCS}</a>
                <a onClick={this._handleLogout}>{strings.LOGOUT}</a>
              </Toolbar>
            </div>
            <div className={'Dashboard-content'}>
              <DashboardTokens
                userApiTokens={user.apiTokens}
                onGenerateApiTokenSuccess={this._updateUser}
                onGenerateApiTokenFailure={this._showSnackbar}
                onDeleteApiTokenSuccess={this._updateUser}
                onDeleteApiTokenFailure={this._showSnackbar}
              />
              <DashboardSubscription
                userSubscription={user.subscription}
                onPlanChangeSuccess={this._updateUser}
                onPlanChangeFailure={this._showSnackbar}
              />
              {!_.isEmpty(user.creditCard) &&
              user.subscription.planId !== keys.STRIPE_FREE_PLAN_ID && (
                <DashboardCreditCard
                  userEmail={user.email}
                  userCreditCard={user.creditCard}
                  onPaymentInfoUpdateSuccess={this._updateUser}
                  onPaymentInfoUpdateFailure={this._showSnackbar}
                />
              )}
            </div>
          </div>
          <Snackbar
            visible={snackbarVisible}
            message={snackbarMessage}
            onCloseClick={this._hideSnackbar}
          />
        </div>
      );
    }
  }
}

export default Dashboard;
