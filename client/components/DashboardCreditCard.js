/* @flow */
import React, { Component } from 'react';
import format from 'date-fns/format';
import DashboardSection from './DashboardSection';
import StripeCheckoutButton from './StripeCheckoutButton';
import backendService from '../services/backend';
import analyticsService from '../services/analytics';
import strings from '../config/strings';
import style from './DashboardCreditCard.css';

import type { CreditCard, User } from '../types';

type Props = {
  userEmail: string,
  userCreditCard: CreditCard,
  onPaymentInfoUpdateSuccess: (user: User) => mixed,
  onPaymentInfoUpdateFailure: (error: Error) => mixed,
};

type State = {
  updatingPaymentInfo: boolean,
};

class DashboardCreditCard extends Component<Props, State> {
  state = {
    updatingPaymentInfo: false,
  };

  _updatePaymentInfo = async (token: string) => {
    this.setState({ updatingPaymentInfo: true });
    try {
      const updatedUser = await backendService.updateUserPaymentInfo(token);
      analyticsService.event({
        category: 'Payment',
        action: 'Updated credit card details',
      });
      this.props.onPaymentInfoUpdateSuccess(updatedUser);
    } catch (err) {
      this.props.onPaymentInfoUpdateFailure(err);
    } finally {
      this.setState({ updatingPaymentInfo: false });
    }
  };

  render() {
    const { userEmail, userCreditCard = {} } = this.props;
    return (
      <DashboardSection
        title={strings.PAYMENT_INFO_TITLE}
        subtitle={strings.PAYMENT_INFO_SUBTITLE}
        rightElement={
          <StripeCheckoutButton
            text={strings.PAYMENT_INFO_UPDATE_BUTTON}
            onStripeTokenReceived={this._updatePaymentInfo}
            amount={null}
            email={userEmail}
            allowRememberMe={false}
          />
        }
        loading={this.state.updatingPaymentInfo}
      >
        <style jsx>{style}</style>
        <header className={'PaymentInfo-header'}>
          <div className={'PaymentInfo-header-cell'}>
            <span>{strings.PAYMENT_INFO_TABLE_HEADER_CARD}</span>
          </div>
          <div className={'PaymentInfo-header-cell'}>
            <span>{strings.PAYMENT_INFO_TABLE_HEADER_UPDATED}</span>
          </div>
        </header>
        {!this.props.loading && (
          <div className={'PaymentInfo-content'}>
            <div className={'PaymentInfo-content-cell'}>
              <div className={'PaymentInfo-content-subscription'}>
                {`${userCreditCard.expMonth}/${userCreditCard.expYear} ${userCreditCard.last4}`}
              </div>
            </div>
            <div className={'PaymentInfo-content-cell'}>
              {format(userCreditCard.createdAt || userCreditCard.updatedAt, 'MMM D, YYYY')}
            </div>
          </div>
        )}
      </DashboardSection>
    );
  }
}

export default DashboardCreditCard;
