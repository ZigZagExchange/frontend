import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Text from "components/atoms/Text/Text";
import InputField from "components/atoms/InputField/InputField";
import { Button as CustomButton } from "components/molecules/Button";

import { CloseIcon } from "components/atoms/Svg";
import { WarningIcon } from "components/atoms/Svg";
import { useDispatch, useSelector } from "react-redux";
import {
  highSlippageModalSelector,
  setHighSlippageModal,
} from "lib/store/features/api/apiSlice";

const ModalWrapper = styled(Dialog)`
  .MuiTypography-root {
    flex-direction: column;
  }

  .MuiPaper-root {
    width: 550px;
    max-width: 100%;
    padding: 19px 20px 25px;
    margin: 2rem 1rem;
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  }

  .MuiDialogContentText-root {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .MuiDialogTitle-root {
    display: flex;
    padding: 0;
  }

  .MuiDialogContent-root {
    padding: 8px 0;
  }

  .warning-icon {
    margin-top: 2rem;

    svg {
      margin: 0 auto;
      width: 50px !important;
      height: 45px !important;
    }

    path {
      fill: ${({ theme }) => theme.colors.warningHighEmphasis} !important;
    }
  }

  .modal-close {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .confirm-button.disabled {
    opacity: 0.45;
    pointer-events: none;
  }

  h2 {
    margin-left: auto;
    line-height: 0;
  }

  div {
    text-align: center;
  }

  b {
    display: inline !important;
  }
`;

const FormDialog = () => {
  const [textValue, setTextValue] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const highSlippageModal = useSelector(highSlippageModalSelector);
  const baseToken = highSlippageModal.marketInfo?.split("-")[0];
  const quoteToken = highSlippageModal.marketInfo?.split("-")[1];
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setHighSlippageModal({ open: false }));
  };

  const handleSubmit = () => {
    dispatch(
      setHighSlippageModal({
        open: false,
        confirmed: textValue === "confirm" ? true : false,
      })
    );
  };

  const onChangeTextValue = (e) => {
    setConfirmed(
      e.currentTarget.value.toLocaleLowerCase() === "confirm" ? true : false
    );
    setTextValue(e.currentTarget.value.toLocaleLowerCase());
  };

  const getCapitalize = (text) => {
    return text[0].toUpperCase() + text.substring(1, text.length);
  };

  return (
    <ModalWrapper
      open={highSlippageModal.open}
      onClose={handleClose}
      className="modal-wrapper"
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        <button onClick={handleClose} className="modal-close">
          <CloseIcon />
        </button>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <div className="warning-icon">
            <WarningIcon />
          </div>
          <Text
            font="primaryHeading6"
            color="foregroundHighEmphasis"
            style={{ marginTop: "28px", display: "block", lineHeight: "25px" }}
          >
            You are placing a {getCapitalize(highSlippageModal.type)} Order for
            <br />
            {highSlippageModal.xToken} {baseToken} @ {highSlippageModal.yToken}{" "}
            {quoteToken}
            <br />
            which is {highSlippageModal.delta.toFixed(2)}% (
            {highSlippageModal.userPrice} {quoteToken}){" "}
            {highSlippageModal.type === "sell" ? "under" : "above"}
            <br />
            the current market price ({highSlippageModal.pairPrice} {quoteToken}
            ).
          </Text>
          <Text
            font="primaryHeading6"
            color="warningHighEmphasis"
            style={{ marginTop: "20px", lineHeight: "25px" }}
          >
            You will lose money when signing this transaction!{" "}
          </Text>

          {/* <Text font="primaryHeading6" color="warningHighEmphasis">
            {highSlippageModal.delta.toFixed(2)}% price slippage.
          </Text> */}

          <Text
            font="primarySmall"
            color="foregroundHighEmphasis"
            style={{ marginTop: "20px", lineHeight: "25px", display: "block" }}
          >
            Type <b>CONFIRM</b> below to continue with the trade.
          </Text>

          <InputField
            type="text"
            pattern="\d+(?:[.,]\d+)?"
            style={{ marginTop: "20px", textAlign: "center" }}
            onChange={(e) => {
              onChangeTextValue(e);
            }}
          />
          <CustomButton
            scale="md"
            style={{
              width: "100%",
              marginTop: "20px",
            }}
            className={`py-3 mt-3 uppercase confirm-button ${
              !confirmed ? "disabled" : ""
            }`}
            onClick={handleSubmit}
          >
            continue with high slippage
          </CustomButton>
        </DialogContentText>
      </DialogContent>
    </ModalWrapper>
  );
};

export default FormDialog;
