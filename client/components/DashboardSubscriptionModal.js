/* @flow */
import React, { Component } from 'react';
import Button from './Button';
import StripeCheckoutButton from './StripeCheckoutButton';
import strings from '../config/strings';
import style from './DashboardSubscriptionModal.css';

type Props = {
  text: string,
  amount?: number,
  onCancelClick: () => mixed,
  onConfirmClick?: () => mixed,
  onStripeTokenReceived?: (token: string) => mixed,
};

class DashboardSubscriptionChangeModal extends Component<Props, void> {
  render() {
    const { text, amount, onCancelClick, onConfirmClick, onStripeTokenReceived } = this.props;
    return (
      <div className={'SubscriptionChangeModal'}>
        <style jsx>{style}</style>
        <p>{text}</p>
        <div className={'SubscriptionChangeModal-footer'}>
          <div className={'SubscriptionChangeModal-button'}>
            <Button onClick={onCancelClick} flat={true}>
              {strings.CANCEL}
            </Button>
          </div>
          <div className={'SubscriptionChangeModal-button'}>
            {amount &&
            onStripeTokenReceived && (
              <StripeCheckoutButton
                text={strings.CONFIRM}
                amount={amount}
                allowRememberMe={false}
                onStripeTokenReceived={onStripeTokenReceived}
              />
            )}
            {!amount && (
              <Button onClick={onConfirmClick} flat={true}>
                {strings.CONFIRM}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DashboardSubscriptionChangeModal;
