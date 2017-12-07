/* @flow */
import React, { Component } from "react";
import format from "date-fns/format";
import DashboardTokensModal from "./DashboardTokensModal";
import Button from "./Button";
import Modal from "./Modal";
import DashboardSection from "./DashboardSection";
import backendService from "../services/backend";
import analyticsService from "../services/analytics";
import strings from "../config/strings";
import keys from "../config/keys";
import style from "./DashboardTokens.css";

import type { ApiToken, User } from "../types";

type Props = {
  userApiTokens: ApiToken[],
  onGenerateApiTokenSuccess: (updatedUser: User) => mixed,
  onGenerateApiTokenFailure: (error: Error) => mixed,
  onDeleteApiTokenSuccess: (updatedUser: User) => mixed,
  onDeleteApiTokenFailure: (error: Error) => mixed
};

type State = {
  visibleTokens: string[],
  modalVisible: boolean,
  generatingApiToken: boolean,
  deletingApiToken: boolean
};

class DashboardTokens extends Component<Props, State> {
  state = {
    visibleTokens: [],
    modalVisible: false,
    generatingApiToken: false,
    deletingApiToken: false
  };

  _showToken = (tokenValue: string) => {
    this.setState({
      visibleTokens: [...this.state.visibleTokens, tokenValue]
    });
  };

  _toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  };

  _generateToken = async (tokenName: string) => {
    this.setState({ generatingApiToken: true, modalVisible: false });
    try {
      const updatedUser = await backendService.createUserApiToken(tokenName);
      this.props.onGenerateApiTokenSuccess(updatedUser);
      analyticsService.event({
        category: "Tokens",
        action: "Created a token"
      });
    } catch (err) {
      this.props.onGenerateApiTokenFailure(err);
    } finally {
      this.setState({ generatingApiToken: false });
    }
  };

  _deleteToken = async (tokenValue: string) => {
    if (!this.deletingApiToken) {
      this.setState({ deletingApiToken: true, modalVisible: false });
      const updatedUser = await backendService.deleteUserApiToken(tokenValue);
      analyticsService.event({
        category: "Tokens",
        action: "Deleted a token"
      });
      this.setState({ deletingApiToken: false });
      this.props.onDeleteApiTokenSuccess(updatedUser);
    }
  };

  render() {
    const { userApiTokens = [] } = this.props;
    const apiTokensLimitReached =
      userApiTokens.length >= keys.MAX_API_TOKENS_PER_USER;
    return (
      <DashboardSection
        title={strings.API_TOKEN_TITLE}
        subtitle={strings.API_TOKEN_SUBTITLE}
        rightButtonText={
          !apiTokensLimitReached ? strings.API_TOKEN_GENERATE_BUTTON : undefined
        }
        onRightButtonClick={
          !apiTokensLimitReached ? this._toggleModal : undefined
        }
        loading={this.state.generatingApiToken || this.state.deletingApiToken}
      >
        <style jsx>{style}</style>
        <header className={"Tokens-header"}>
          <div className={"Tokens-header-cell-name"}>
            <span>{strings.API_TOKEN_TABLE_HEADER_NAME}</span>
          </div>
          <div className={"Tokens-header-cell-token"}>
            <span>{strings.API_TOKEN_TABLE_HEADER_TOKEN}</span>
          </div>
          <div className={"Tokens-header-cell-date"}>
            <span>{strings.API_TOKEN_TABLE_HEADER_UPDATED}</span>
          </div>
          <div className={"Tokens-header-cell-delete"}>
            <span />
          </div>
        </header>
        {!this.props.loading &&
          userApiTokens.map((apiToken, index) => {
            const disableDelete =
              this.state.generatingApiToken || this.state.deletingApiToken;
            const visible =
              this.state.visibleTokens.indexOf(apiToken.value) !== -1;
            return (
              <div className={"Tokens-content"} key={`api-token-${index}`}>
                <div className={"Tokens-content-left"}>
                  <div className={"Tokens-content-cell-name"}>
                    {apiToken.name}
                  </div>
                  <div className={"Tokens-content-cell-token"}>
                    {visible ? (
                      <div className={"Tokens-content-token-visible"}>
                        {apiToken.value}
                      </div>
                    ) : (
                      <div
                        style={{
                          backgroundImage: `url(/static/secret-blur.png)`
                        }}
                        className={"Tokens-content-token-hidden"}
                      >
                        <Button
                          onClick={() => this._showToken(apiToken.value)}
                          type={"info"}
                        >
                          {strings.API_TOKEN_REVEAL_BUTTON}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className={"Tokens-content-cell-date"}>
                    {format(apiToken.createdAt, "MMM D, YYYY")}
                  </div>
                </div>
                <div
                  className={`Tokens-content-cell-delete ${disableDelete
                    ? "Tokens-content-cell-delete-disabled"
                    : ""}`}
                  onClick={() =>
                    !disableDelete && this._deleteToken(apiToken.value)}
                >
                  <img
                    src={"/static/ic_delete_white_24px.svg"}
                    alt={"Delete"}
                  />
                </div>
              </div>
            );
          })}
        <Modal
          title={strings.API_TOKEN_GENERATOR_MODAL_TITLE}
          onCancelClick={this._toggleModal}
          visible={this.state.modalVisible}
        >
          <DashboardTokensModal onConfirm={this._generateToken} />
        </Modal>
      </DashboardSection>
    );
  }
}

export default DashboardTokens;
