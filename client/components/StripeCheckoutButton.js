/* @flow */
import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";
import Button from "./Button";
import keys from "../config/keys";
import strings from "../config/strings";
import style from "./StripeCheckoutButton.css";

type Props = {
  text: string,
  amount: ?number,
  allowRememberMe?: boolean,
  email?: string,
  onStripeTokenReceived: (token: string) => mixed
};

class StripeCheckoutButton extends Component<Props, void> {
  render() {
    const {
      amount,
      allowRememberMe,
      email,
      text,
      onStripeTokenReceived,
      ...otherProps
    } = this.props;
    return (
      <StripeCheckout
        token={(token: any) => onStripeTokenReceived(token.id)}
        stripeKey={keys.STRIPE_PUBLIC_KEY}
        name={strings.APP_NAME}
        description={strings.APP_DESCRIPTION}
        amount={amount}
        allowRememberMe={allowRememberMe}
        panelLabel={text}
        email={email}
        image={"/static/logo@2x.png"}
        {...otherProps}
      >
        <style jsx>{style}</style>
        <Button>{text}</Button>
      </StripeCheckout>
    );
  }
}

export default StripeCheckoutButton;
