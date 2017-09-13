/* @flow */
import React, { Component } from 'react';
import style from './Button.css';

type Props = {
  type?: 'default' | 'info' | 'warn' | 'danger',
  size?: 'medium' | 'big',
  fill?: boolean,
  flat?: boolean,
  children?: any,
};

class Button extends Component<Props, void> {
  render() {
    const { type = 'default', size = 'medium', flat, fill, children, ...otherProps } = this.props;
    const typeClassName = `Button-${type}`;
    const sizeClassName = `Button-${size}`;
    const fillClassName = fill ? 'Button-fill' : '';
    const flatClassName = flat ? 'Button-flat' : '';
    return (
      <button
        className={`Button ${typeClassName} ${fillClassName} ${flatClassName} ${sizeClassName}`}
        {...otherProps}
      >
        <style jsx>{style}</style>
        {children}
      </button>
    );
  }
}

export default Button;
