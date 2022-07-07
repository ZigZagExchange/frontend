import React from "react";
import { CloseIcon } from "components/atoms/Svg";
import arrowRight from "assets/images/gradient-arrow-narrow-right.svg";
import arrwoDown from "assets/images/gradient-arrow-narrow-down.svg";
import step1 from "assets/images/step1.png";
import step2 from "assets/images/step2.png";
import step3 from "assets/images/step3.png";

const GetStartedPopup = ({ onCloseBtn }) => {
  return (
    <div className="max-w-3xl p-5 mt-10 border rounded-lg shadow-lg bg-background-700 border-foreground-400">
      <div className="flex items-center justify-between pb-3 border-b border-foreground-400">
        <p className="text-xl font-semibold font-work">
          Get Started with ZigZag
        </p>
        <CloseIcon
          className="cursor-pointer hover:opacity-75"
          onClick={onCloseBtn}
        />
      </div>
      <div className="py-3">
        <p className="text-sm font-work">
          Trading on L2 has never been easier. You’re only a couple steps away!
        </p>
      </div>
      <div className="flex-col items-center justify-center md:flex-row md:flex">
        <div className="p-3 border border-foreground-400 rounded-2xl basis-1/3">
          <p className="text-2xl">Step 1</p>
          <p className="mt-2">
            Launch your app by clicking “Start Trading” and connect your wallet.
          </p>
          <img src={step1} alt="step1" className="mt-3" />
        </div>
        <img
          src={arrowRight}
          alt="arrowRight"
          className="hidden mx-2 md:flex"
        />
        <div className="flex justify-center">
          <img src={arrwoDown} alt="arrowRight" className="my-2 md:hidden" />
        </div>

        <div className="p-3 border border-foreground-400 rounded-2xl basis-1/3">
          <p className="text-2xl">Step 2</p>
          <p className="mt-2">Migrate funds over via the ZigZag bridge..</p>
          <img src={step2} alt="step2" className="mt-3" />
        </div>
        <img
          src={arrowRight}
          alt="arrowRight"
          className="hidden mx-2 md:flex"
        />
        <div className="flex justify-center">
          <img src={arrwoDown} alt="arrowRight" className="my-2 md:hidden" />
        </div>
        <div className="p-3 border border-foreground-400 rounded-2xl basis-1/3">
          <p className="text-2xl">Step 3</p>
          <p className="mt-2">Start trading!.</p>
          <img src={step3} alt="step3" className="mt-3" />
        </div>
      </div>
    </div>
  );
};

export default GetStartedPopup;
