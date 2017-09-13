/* @flow */
import React, { Component } from 'react';
import style from './Toolbar.css';

type Props = {
  onTitleClick?: () => mixed,
  children?: any,
};

class TextInput extends Component<Props, void> {
  render() {
    const { onTitleClick } = this.props;
    return (
      <div className={'Toolbar'}>
        <style jsx>{style}</style>
        <div className={'Toolbar-left'} onClick={onTitleClick ? onTitleClick : () => null}>
          <div className={'Toolbar-logo'} alt={'App icon'} />
          <h3 className={'Toolbar-title'}>NumValidate</h3>
        </div>
        <div className={'Toolbar-links'}>{this.props.children}</div>
      </div>
    );
  }
}

export default TextInput;
