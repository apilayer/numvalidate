/* @flow */
import React, { Component } from 'react';
import Typed from 'typed.js';
import style from './HomeTerminal.css';

type Props = {};

const CURL_COMMAND_1 =
  '`<b> ~ $ </b>`^500curl https://numvalidate.com/api/validate?number=12015550123';

const VALIDATION_OUTPUT_1 = `{
    "valid": true,
    "number": "12015550123",
    "e164Format": "+12015550123",
    "internationalFormat": "+1 201-555-0123",
    "nationalFormat": "(201) 555-0123",
    "countryCode": "US",
    "countryPrefix": "1",
    "countryName": "United States"
  }`;

const CURL_COMMAND_2 =
  '`<b> ~ $ </b>`^500curl https://numvalidate.com/api/validate?number=123456789';

const VALIDATION_OUTPUT_2 = `{
    "valid": false,
    "number": "123456789"
  }`;

const CURL_COMMAND_3 =
  '`<b> ~ $ </b>`^500curl https://numvalidate.com/api/validate?number=16518675309';

const VALIDATION_OUTPUT_3 = `{
    "valid": true,
    "number": "16518675309",
    "e164Format": "+16518675309",
    "internationalFormat": "+1 651-867-5309",
    "nationalFormat": "(651) 867-5309"
    "countryCode": "US",
    "countryPrefix": "1",
    "countryName": "United States",
  }`;

class HomeTerminal extends Component<Props, void> {
  componentDidMount() {
    new Typed('#typed-demo', {
      strings: [
        '' + CURL_COMMAND_1 + '\n^2000 `' + VALIDATION_OUTPUT_1 + '\n<b> ~ $</b>`',
        '' + CURL_COMMAND_2 + '\n^2000 `' + VALIDATION_OUTPUT_2 + '\n<b> ~ $</b>`',
        '' + CURL_COMMAND_3 + '\n^2000 `' + VALIDATION_OUTPUT_3 + '\n<b> ~ $</b>`',
      ],
      smartBackspace: false,
      typeSpeed: 50,
      fadeOut: true,
      fadeOutDelay: 200,
      backDelay: 3000,
      loop: true,
    });
  }

  render() {
    return (
      <div className={`HomeTerminal`}>
        <style jsx>{style}</style>
        <div className={'HomeTerminal-header'}>
          <span className={'HomeTerminal-header-close'} />
          <span className={'HomeTerminal-header-minimize'} />
          <span className={'HomeTerminal-header-full'} />
          <div className={'HomeTerminal-header-title'}>bash</div>
        </div>
        <div className={'HomeTerminal-body'}>
          <span id={'typed-demo'} />
        </div>
      </div>
    );
  }
}

export default HomeTerminal;
