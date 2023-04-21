import { useState } from "react";
import { useDispatch } from "react-redux";
import React from "react";
import { setUISettings } from "lib/store/features/api/apiSlice";
import { CloseIcon } from "components/atoms/Svg";
import { useTranslation } from "react-i18next";
import useTheme from "components/hooks/useTheme";
import classNames from "classnames";

const NewFeaturesPopup = () => {
  const [open, setOpen] = useState(true);
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onClose = () => {
    setOpen(false);
  };

  const onDismissPermanently = () => {
    dispatch(
      setUISettings({ key: "hideZigZagLiveOnArbitrumPopup", value: true })
    );
  };

  return (
    open && (
      <div className={classNames(isDark && "dark")}>
        <div className="fixed z-20 max-w-lg p-6 mx-1 border rounded-lg shadow-lg md:mx-0 xl:max-w-sm bottom-5 left-5 dark:bg-background-900 dark:border-foreground-400 border-primary-400 bg-foreground-900 dark:text-foreground-900 text-background-900">
          <div className="relative">
            <CloseIcon
              className="absolute cursor-pointer right-1 hover:opacity-75"
              onClick={onClose}
            />
            <p className="text-xl font-semibold font-work">
              {t("orderbook_live_on_arbitrum")}
            </p>
            <p className="mt-3 text-base">
              {t("orderbook_live_on_arbitrum_description_p1")}
            </p>
            <p className="mt-3 text-base">
              {t("orderbook_live_on_arbitrum_description_p2")}
            </p>
            <button
              className="float-right mt-6 text-primary-900 hover:underline"
              onClick={onDismissPermanently}
            >
              {t("dismiss_and_dont_show_again")}.
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default NewFeaturesPopup;
