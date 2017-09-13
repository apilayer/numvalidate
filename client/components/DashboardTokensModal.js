/* @flow */
import React, { Component } from 'react';
import Button from './Button';
import TextInput from './TextInput';
import strings from '../config/strings';
import style from './DashboardTokensModal.css';

type Props = {
  onConfirm: (tokenName: string) => mixed,
};

type State = {
  inputNameValue: string,
  inputNamePristine: boolean,
};

class DashboardTokensModal extends Component<void, Props, State> {
  state = {
    inputNameValue: '',
    inputNamePristine: true,
  };

  _handleInputChange = (e: any) => {
    this.setState({ inputNameValue: e.target.value, inputNamePristine: false });
  };

  _handleConfirm = () => {
    this.props.onConfirm(this.state.inputNameValue);
    this.setState({ inputNameValue: '', inputNamePristine: true });
  };

  render() {
    const { inputNameValue, inputNamePristine } = this.state;
    const error =
      !inputNamePristine && !inputNameValue ? strings.API_TOKEN_GENERATOR_INPUT_REQUIRED : null;
    return (
      <div className={'TokensGenerator'}>
        <style jsx>{style}</style>
        <div className={'TokensGenerator-body'}>
          <TextInput
            placeholder={strings.API_TOKEN_GENERATOR_INPUT_PLACEHOLDER}
            value={inputNameValue}
            error={error}
            onChange={this._handleInputChange}
          />
        </div>
        <div className={'TokensGenerator-footer'}>
          <Button onClick={this._handleConfirm} fill={true} disabled={!inputNameValue}>
            {strings.API_TOKEN_GENERATOR_BUTTON_TEXT}
          </Button>
        </div>
      </div>
    );
  }
}

export default DashboardTokensModal;
