/* @flow */
import React from 'react';
import Head from 'next/head';
import keys from '../config/keys';
import style from './PageHead.css';

type Props = {
  title: string,
};

const PageHead = (props: Props) => {
  return (
    <Head>
      <title>{props.title}</title>
      <meta charset={'utf-8'} />
      <meta
        name={'description'}
        content={
          'Free and open source REST API that provides a simple yet effective way to validate and format a phone number.'
        }
      />
      {keys.GOOGLE_SITE_VERIFICATION && (
        <meta name={'google-site-verification'} content={keys.GOOGLE_SITE_VERIFICATION} />
      )}
      <meta name={'author'} content={'Mazzarolo Matteo'} />
      <meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
      <meta property={'og:url'} content={'https://numvalidate.com'} />
      <meta property={'og:title'} content={'NumValidate'} />
      <meta property={'og:description'} content={'Open Source phone number validation REST API'} />
      <meta property={'og:image'} content={'/static/logo.png'} />
      <meta name={'theme-color'} content={'#21272f'} />
      <link
        rel={'apple-touch-icon'}
        sizes={'152x152'}
        href={'/static/favicons/apple-touch-icon-152x152.png'}
      />
      <link rel={'shotcut icon'} type={'image/x-icon'} href={'/static/favicons/favicon.ico'} />
      <meta name={'msapplication-TileColor'} content={'#21272f'} />
      <meta name={'msapplication-TileImage'} content={'/static/favicons/mstile-144x144.png'} />
      <link rel={'manifest'} href={'/static/manifest.json'} />
    </Head>
  );
};

export default PageHead;
