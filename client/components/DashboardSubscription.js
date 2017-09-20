/* @flow */
import React, { Component } from 'react';
import Modal from './Modal';
import Button from './Button';
import DashboardSection from './DashboardSection';
import DashboardSubscriptionModal from './DashboardSubscriptionModal';
import backendService from '../services/backend';
import analyticsService from '../services/analytics';
import strings from '../config/strings';
import keys from '../config/keys';
import style from './DashboardSubscription.css';

import type { Subscription, User } from '../types';

type Props = {
  userSubscription?: Subscription,
  onPlanChangeSuccess: (updatedUser: User) => mixed,
  onPlanChangeFailure: (error: Error) => mixed,
};

type State = {
  visibleModal: ?'FREE' | 'PRO',
  updatingSubscriptionPlan: boolean,
};

class DashboardSubscription extends Component<Props, State> {
  state = {
    visibleModal: null,
    updatingSubscriptionPlan: false,
  };

  _showModal = (modalType: 'FREE' | 'PRO') => {
    this.setState({ visibleModal: modalType });
  };

  _hideModal = () => {
    this.setState({ visibleModal: null });
  };

  _updateSubscriptionPlan = async (planId: string, token?: string) => {
    this.setState({ visibleModal: null, updatingSubscriptionPlan: true });
    try {
      const updatedUser = await backendService.updateUserSubscription(planId, token);
      analyticsService.event({
        category: 'Subscription',
        action: `Updated subscription to ${token ? 'pro' : 'free'} plan`,
      });
      this.props.onPlanChangeSuccess(updatedUser);
    } catch (err) {
      this.props.onPlanChangeFailure(err);
    } finally {
      this.setState({ updatingSubscriptionPlan: false });
    }
  };

  render() {
    const { userSubscription = {} } = this.props;
    return (
      <DashboardSection
        title={strings.SUBSCRIPTION_TITLE}
        subtitle={strings.SUBSCRIPTION_SUBTITLE}
        loading={this.state.updatingSubscriptionPlan}
      >
        <style jsx>{style}</style>
        <header className={'Subscription-header'}>
          <div className={'Subscription-header-cell'}>
            <span>{strings.SUBSCRIPTION_TABLE_HEADER_SUBSCRIPTION}</span>
          </div>
          <div className={'Subscription-header-cell'}>
            <span />
          </div>
        </header>
        <div>
          <div className={'Subscription-content'}>
            <div className={'Subscription-content-cell'}>
              <p>
                <span className={'Subscription-content-cell-amount'}>
                  {strings.PAYMENT_INFO_FREE_PLAN_AMOUNT}
                </span>
                <span className={'Subscription-content-cell-separator'}>{' - '}</span>
                <span className={'Subscription-content-cell-description'}>
                  {strings.PAYMENT_INFO_FREE_PLAN_DESCRIPTION}
                </span>
              </p>
            </div>
            {userSubscription.planId === keys.STRIPE_FREE_PLAN_ID && (
              <p className={'Subscription-content-cell-current'}>
                {strings.SUBSCRIPTION_CURRENT_PLAN}
              </p>
            )}
            {userSubscription.planId !== keys.STRIPE_FREE_PLAN_ID && (
              <Button
                onClick={() => this._showModal('FREE')}
                disabled={this.state.updatingSubscriptionPlan}
                type={'info'}
              >
                {strings.SUBSCRIPTION_SELECT_BUTTON}
              </Button>
            )}
          </div>
          <div className={'Subscription-content'}>
            <div className={'Subscription-content-cell'}>
              <p>
                <span className={'Subscription-content-cell-amount'}>
                  {strings.PAYMENT_INFO_PRO_PLAN_AMOUNT}
                </span>
                <span className={'Subscription-content-cell-separator'}>{' - '}</span>
                <span className={'Subscription-content-cell-description'}>
                  {strings.PAYMENT_INFO_PRO_PLAN_DESCRIPTION}
                </span>
              </p>
            </div>
            {userSubscription.planId === keys.STRIPE_PRO_PLAN_ID && (
              <p className={'Subscription-content-cell-current'}>
                {strings.SUBSCRIPTION_CURRENT_PLAN}
              </p>
            )}
            {userSubscription.planId !== keys.STRIPE_PRO_PLAN_ID && (
              <Button
                onClick={() => this._showModal('PRO')}
                disabled={this.state.updatingSubscriptionPlan}
                type={'info'}
              >
                {strings.SUBSCRIPTION_SELECT_BUTTON}
              </Button>
            )}
          </div>
        </div>
        {this.state.visibleModal === 'FREE' && (
          <Modal
            title={strings.PAYMENT_INFO_PRO_MODAL_TITLE}
            onCancelClick={this._hideModal}
            visible={true}
          >
            <DashboardSubscriptionModal
              text={strings.PAYMENT_INFO_FREE_MODAL_TEXT}
              onCancelClick={this._hideModal}
              onConfirmClick={() => this._updateSubscriptionPlan(keys.STRIPE_FREE_PLAN_ID || '')}
            />
          </Modal>
        )}
        {this.state.visibleModal === 'PRO' && (
          <Modal
            title={strings.PAYMENT_INFO_PRO_MODAL_TITLE}
            onCancelClick={this._hideModal}
            visible={true}
          >
            <DashboardSubscriptionModal
              text={strings.PAYMENT_INFO_PRO_MODAL_TEXT}
              onCancelClick={this._hideModal}
              onStripeTokenReceived={(token: string) =>
                this._updateSubscriptionPlan(keys.STRIPE_PRO_PLAN_ID || '', token)}
              amount={keys.STRIPE_PRO_PLAN_AMOUNT}
            />
          </Modal>
        )}
      </DashboardSection>
    );
  }
}

export default DashboardSubscription;
