/* @flow */
import React, { Component } from 'react';

import style from './Modal.css';

type Props = {
  title: string,
  onCancelClick: () => mixed,
  visible: boolean,
  children?: any,
};

class Modal extends Component<void, Props, void> {
  render() {
    const { title, visible, onCancelClick, children } = this.props;
    if (visible) {
      return (
        <div className={`Modal-backdrop`}>
          <style jsx>{style}</style>
          <div className={`Modal`}>
            <div className={'Modal-header-back'} onClick={onCancelClick}>
              <div className={'Modal-header-back-arrow'} />
              <p className={'Modal-header-back-text'}>{'Back'}</p>
            </div>
            <header className={'Modal-header'}>
              <h2>{title}</h2>
            </header>
            <div className={'Modal-body'}>{children}</div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Modal;
