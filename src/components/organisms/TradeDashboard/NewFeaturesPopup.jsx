import { useState } from "react";
import { useDispatch } from "react-redux";
import React from "react";
import { setUISettings } from "lib/store/features/api/apiSlice";
import { CloseIcon } from "components/atoms/Svg";

const NewFeaturesPopup = () => {
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();

  const onClose = () => {
    setOpen(false);
  };

  const onDismissPermanently = () => {
    dispatch(setUISettings({ key: "hideLayoutGuidePopup", value: true }));
  };

  return (
    open && (
      <div className="max-w-lg p-6 mx-1 border rounded-lg shadow-lg md:mx-0 xl:max-w-sm fixed bottom-5 left-5 dark:bg-background-900 dark:border-foreground-400 border-primary-400 bg-foreground-900  dark:text-foreground-900 text-background-900 z-[2]">
        <div className="relative">
          <CloseIcon
            className="absolute cursor-pointer right-1 hover:opacity-75"
            onClick={onClose}
          />
          <p className="text-xl font-semibold font-work">
            Introducing Dynamic Layouts!
          </p>
          <p className="mt-3 text-base ">
            You can now adjust the interface to your liking by accessing the
            dynamic layouts feature in the ''Settings'' tab (top right corner).
          </p>
          <button
            className="float-right mt-6 text-primary-900 hover:underline"
            onClick={onDismissPermanently}
          >
            Dismiss and don’t show again.
          </button>
        </div>
      </div>
    )
  );
};

export default NewFeaturesPopup;
