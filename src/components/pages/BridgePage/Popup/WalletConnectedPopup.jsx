import React from "react";
import checkedIcon from "assets/images/checkedIcon.svg";

const WalletConnectedPopup = ({ onClickGetStarted }) => {
  return (
    <div className="flex gap-4 p-5 mt-10 border rounded-lg shadow-md dark:bg-success-600 bg-success-500 border-foreground-400">
      <img src={checkedIcon} alt="checkedIcon" className="" />
      <div>
        <p className="text-xl font-semibold font-work">Wallet Connected</p>
        <p className="mt-1">
          Bridge your funds and activate your account to{" "}
          <button
            className="font-semibold hover:underline underline-offset-2 font-work"
            onClick={onClickGetStarted}
          >
            get started
          </button>
        </p>
      </div>
    </div>
  );
};

export default WalletConnectedPopup;
