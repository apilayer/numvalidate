/* @flow */
import React, { Component } from 'react';
import Button from './Button';
import strings from '../config/strings';
import style from './Snackbar.css';

type Props = {
  message?: string,
  visible?: boolean,
  onCloseClick: () => mixed,
};

class Snackbar extends Component<Props, void> {
  render() {
    const { message = '', visible, onCloseClick } = this.props;
    return (
      <div className={`Snackbar Snackbar-${visible ? 'enter' : 'exit'}`}>
        <style jsx>{style}</style>
        <div className={'Snackbar-content'}>
          <p>{message}</p>
          <Button type={'danger'} flat={true} onClick={onCloseClick}>
            {strings.CLOSE}
          </Button>
        </div>
      </div>
    );
  }
}

export default Snackbar;
