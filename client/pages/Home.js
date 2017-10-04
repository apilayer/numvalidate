/* @flow */
import React, { Component } from 'react';
import PageHead from '../components/PageHead';
import Toolbar from '../components/Toolbar';
import Button from '../components/Button';
import HomeTerminal from '../components/HomeTerminal';
import authService from '../services/auth';
import analyticsService from '../services/analytics';
import keys from '../config/keys';
import strings from '../config/strings';
import globalStyle from '../globals.css';
import style from './Home.css';

type Props = {
  authenticated: boolean,
};

class Home extends Component<Props, void> {
  static getInitialProps(ctx) {
    const authenticated = authService.isAuthenticated(ctx.req);
    return { authenticated };
  }

  componentDidMount() {
    authService.initialize();
    analyticsService.initialize();
    analyticsService.pageView();
  }

  _handleToolbarTitleClick = () => {
    window.location.href = `${window.location.origin}`;
  };

  _handleDashboardClick = () => {
    window.location.href = `${window.location.origin}/dashboard`;
  };

  _handleLoginClick = () => {
    authService.authorize();
  };

  render() {
    return (
      <div className={'Home'}>
        <PageHead title={'NumValidate: Phone number validation REST API'} />
        <style jsx global>
          {globalStyle}
        </style>
        <style jsx>{style}</style>

        <div className={'Home-intro'}>
          <div className={'Home-intro-toolbar'}>
            <Toolbar onTitleClick={this._handleToolbarTitleClick}>
              <a href={keys.DOCS_URL}>{strings.DOCS}</a>
              {this.props.authenticated ? (
                <a onClick={this._handleDashboardClick}>{strings.DASHBOARD}</a>
              ) : (
                <a onClick={this._handleLoginClick}>{strings.LOGIN}</a>
              )}
            </Toolbar>
          </div>

          <div className={'Home-intro-content'}>
            <div className={'Home-intro-title'}>
              <h1>
                Phone number validation REST API.
                <br />
                <span className={'Home-intro-title-bold'}>Simple</span>,{' '}
                <span className={'Home-intro-title-bold'}>Free</span>, and{' '}
                <span className={'Home-intro-title-bold'}>Open Source</span>.
              </h1>
            </div>
            <div className={'Home-intro-terminal'}>
              <HomeTerminal />
            </div>
            <div className={'Home-intro-description'}>
              <p>
                NumValidate is an open source REST API that provides a simple yet effective way to
                validate and format a phone number.
              </p>
            </div>
            <div className={'Home-intro-button'}>
              {this.props.authenticated ? (
                <Button size={'big'} onClick={this._handleDashboardClick}>
                  {strings.HOME_SIGNUP_NOW_AUTHENTICATED}
                </Button>
              ) : (
                <Button size={'big'} onClick={this._handleLoginClick}>
                  {strings.HOME_SIGNUP_NOW_UNAUTHENTICATED}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={'Home-sep'} />

        <div className={'Home-plans'}>
          <h1>Available plans</h1>
          <div className={'Home-plans-row'}>
            <div className={'Home-plans-plan'}>
              <h1 className={'Home-plans-plan-name'}>Unauthenticated</h1>
              <h2 className={'Home-plans-plan-price'}>0</h2>
              <ul>
                <li className={'Home-plans-plan-description'}>Fully-featured validation</li>
                <li className={'Home-plans-plan-description'}>
                  Up to {keys.RATE_LIMIT_FOR_UNAUTHENTICATED_REQUESTS} daily API requests
                </li>
              </ul>
            </div>
            <div className={'Home-plans-plan'}>
              <h1 className={'Home-plans-plan-name'}>Free</h1>
              <h2 className={'Home-plans-plan-price'}>0</h2>
              <ul>
                <li className={'Home-plans-plan-description'}>Fully-featured validation</li>
                <li className={'Home-plans-plan-description'}>
                  Up to {keys.RATE_LIMIT_FOR_FREE_USER_REQUESTS} daily API requests
                </li>
                <li className={'Home-plans-plan-description'}>API tokens generation</li>
              </ul>
            </div>
            <div className={'Home-plans-plan'}>
              <h1 className={'Home-plans-plan-name'}>Pro</h1>
              <h2 className={'Home-plans-plan-price'}>3.99</h2>
              <ul>
                <li className={'Home-plans-plan-description'}>Fully-featured validation</li>
                <li className={'Home-plans-plan-description'}>
                  Up to {keys.RATE_LIMIT_FOR_PRO_USER_REQUESTS} daily API requests
                </li>
                <li className={'Home-plans-plan-description'}>API tokens generation</li>
                <li className={'Home-plans-plan-description'}>Private email support</li>
              </ul>
            </div>
          </div>
          <p className={'Home-plans-plan-footer'}>
            If your project is open source or you just need an higher rate limit feel free to{' '}
            <a href={`mailto:numvalidateapp@gmail.com?subject=I need an higher rate limit`}>
              contact me
            </a>
            .
          </p>
        </div>

        <div className={'Home-sep'} />

        <div className={'Home-faq'}>
          <h1>FAQ</h1>
          <div className={'Home-faq-question'}>
            <h3>How are phone numbers validated?</h3>
            <p>
              NumValidates is powered by{' '}
              <a href={'https://github.com/googlei18n/libphonenumber'}>Google LibPhoneNumber</a>, a
              phone number formatting and parsing library released by Google, originally developed
              for (and currently used in) Google's Android mobile phone operating system, which uses
              several rigorous rules for parsing, formatting, and validating phone numbers for all
              countries/regions of the world.
            </p>
          </div>
          <div className={'Home-faq-question'}>
            <h3>What should I use NumValidate for?</h3>
            <p>
              Validating a phone number allows you to keep your user database clean and fight frauds
              by validating phone numbers at the point of entry into your system. <br /> NumValidate
              also allows you to format a phone number in the{' '}
              <a href={'https://it.wikipedia.org/wiki/E.164'}>E164 format</a>, which is the standard
              that you should use for safely storing you phone numbers.
            </p>
          </div>
          <div className={'Home-faq-question'}>
            <h3>What's the reason behind the rate limiting?</h3>
            <p>
              Simply put: the rate limit ensures an high quality of service for all API consumers.<br />{' '}
              To enjoy the default rate limit of {keys.RATE_LIMIT_FOR_FREE_USER_REQUESTS} requests
              per day, you'll need to sign-up for a free account and then head to your dashboard to
              generate an API keys.
            </p>
          </div>
          <div className={'Home-faq-question'}>
            <h3>Why is there a paid plan? Isn't this a free project?</h3>
            <p>
              The paid plan{' '}
              <i>
                <b>should</b>
              </i>{' '}
              be the main way to pay up the infrastructure.<br /> However, this is an open source
              project: You can find all its code on{' '}
              <a href="https://github.com/mmazzarolo/numvalidate">Github</a>, and if you think
              that the proposed price for the pro plan is too high you're free to install it in your
              own server.<br />
              Payments can be made via Credit Card (Visa, MasterCard, Discover, Diner's Club) and
              are secured by <a href="https://stripe.com">Stripe</a>.<br />You can change your
              payment method at any given time in the Payment section of your Account Dashboard.
            </p>
          </div>
          <div className={'Home-faq-question'}>
            <h3>Could you tell us the story behind NumValidate?</h3>
            <p>
              Of course!<br />
              NumValidate was born in the summer 2017 from a meeting between the holiday boredom and
              the desire to test myself in building a "simple API gateway".<br />You can see by
              yourself in the Github repository that only a small portion of the code handles the
              phone number validation, while the biggest part of the project just supports the
              authentication, caching and API token management.
            </p>
          </div>
          <div className={'Home-faq-question'}>
            <h3>Is there any way I can support the project?</h3>
            <p>
              I'm putting this in the FAQ even if we all know this is not a frequent question by any
              means シ.<br />If you're liking NumValidate, the best way to support the project is by
              contributing to it on Github: Pull requests with new features/fixes and discussions
              are warmly welcomed.<br />
            </p>
          </div>
        </div>

        <div className={'Home-sep'} />

        <div className={'Home-footer'}>
          <p className={'Home-footer-credit'}>
            Made with ♥ by <a href={'http://mmazzarolo.com'}>Mazzarolo Matteo</a>
          </p>
          <div className={'Home-footer-left'}>
            <a href={`mailto:numvalidateapp@gmail.com?subject=Support`}>Support</a>
            <a href={`https://github.com/mmazzarolo/numvalidate`}>GitHub</a>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
