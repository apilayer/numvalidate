/* @flow */
import React, { Component } from 'react';
import style from './Spinner.css';

type Props = {
  visible?: boolean,
};

class Spinner extends Component<void, Props, void> {
  render() {
    const { visible, ...otherProps } = this.props;
    return (
      <div className={visible ? 'Spinner-visible' : 'Spinner-hidden'} {...otherProps}>
        <style jsx>{style}</style>
      </div>
    );
  }
}

export default Spinner;
