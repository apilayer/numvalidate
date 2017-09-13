/* @flow */
import React, { Component } from 'react';
import style from './TextInput.css';

type Props = {
  label?: ?string,
  error?: ?string,
};

class TextInput extends Component<void, Props, void> {
  render() {
    const { label, error, ...otherProps } = this.props;
    return (
      <div className={'TextInput'}>
        <style jsx>{style}</style>
        {label && <p className={'TextInput-label'}>{label}</p>}
        <input type={'text'} className={'TextInput-input'} {...otherProps} />
        <p className={'TextInput-error'}>{error}</p>
      </div>
    );
  }
}

export default TextInput;
