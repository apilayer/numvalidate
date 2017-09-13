/* @flow */
import React from 'react';
import Spinner from './Spinner';
import Button from './Button';
import style from './DashboardSection.css';

type Props = {
  title: string,
  subtitle: string,
  rightElement?: any,
  rightButtonText?: string,
  rightButtonType?: string,
  onRightButtonClick?: () => mixed,
  loading?: boolean,
  children?: any,
};

const DashboardSection = (props: Props) => {
  const {
    title,
    subtitle,
    rightElement,
    rightButtonText,
    onRightButtonClick,
    loading,
    children,
  } = props;
  let rightButton;
  if (rightElement) {
    rightButton = rightElement;
  } else if (rightButtonText && onRightButtonClick) {
    rightButton = <Button onClick={onRightButtonClick}>{rightButtonText}</Button>;
  }
  return (
    <section className={'DashboardSection'}>
      <style jsx>{style}</style>
      <header className={'DashboardSection-header'}>
        <div className={'DashboardSection-header-left'}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className={'DashboardSection-header-right'}>
          {!loading && rightButton}
          {loading && <Spinner visible={true} />}
        </div>
      </header>
      {children}
    </section>
  );
};

export default DashboardSection;
