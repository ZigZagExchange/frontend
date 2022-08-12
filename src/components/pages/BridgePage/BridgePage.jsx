import React, { useEffect, useState } from "react";
import useTheme from "components/hooks/useTheme";
import { useSelector } from "react-redux";
import { userSelector } from "lib/store/features/auth/authSlice";
// import { settingsSelector } from "lib/store/features/api/apiSlice";
import { DefaultTemplate } from "components";
import BridgeContainer from "./BridgeContainer";
import TransferHistory from "./TransferHistory";
// import GuidePopup from "./Popup/GuidePopup";
import GetStartedPopup from "./Popup/GetStartedPopup";
import WalletConnectedPopup from "./Popup/WalletConnectedPopup";
import classNames from "classnames";
import { Tab } from "@headlessui/react";

const tabList = ["Bridge", "Transfer History"];

export default function BridgePage() {
  const { isDark } = useTheme();
  const [popup, setpopup] = useState("walletconnected");
  const user = useSelector(userSelector);
  // const settings = useSelector(settingsSelector);

  useEffect(() => {
    document.title = "ZigZag Bridge";
  }, []);

  return (
    <DefaultTemplate>
      <div className="flex justify-center">
        {user.address && !user.id && popup === "walletconnected" && (
          <WalletConnectedPopup
            onClickGetStarted={() => setpopup("getstarted")}
          />
        )}
        {user.address && !user.id && popup === "getstarted" && (
          <GetStartedPopup onCloseBtn={() => setpopup("")} />
        )}
      </div>
      <div
        className={classNames("flex flex-col items-center", {
          dark: isDark,
        })}
      >
        <div className="w-full max-w-lg px-1 sm:px-0">
          <p className="mt-10 text-3xl font-semibold font-work ">
            ZigZag Bridge
          </p>
          <div className="px-2 py-3 sm:px-0">
            <Tab.Group>
              <Tab.List className="flex space-x-5 border-b dark:border-foreground-500 border-primary-500">
                {tabList.map((item, index) => {
                  return (
                    <Tab
                      key={index}
                      className={({ selected }) =>
                        classNames(
                          "py-2.5 text-sm font-medium leading-5 uppercase",
                          "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none",
                          selected
                            ? "text-white-900 font-bold border-b-[4px] border-secondary-900"
                            : "text-gray-500 hover:text-gray-400"
                        )
                      }
                    >
                      {item}
                    </Tab>
                  );
                })}
              </Tab.List>
              <Tab.Panels className="mt-2">
                <Tab.Panel className="outline-none">
                  <BridgeContainer />
                </Tab.Panel>
                <Tab.Panel>
                  <TransferHistory />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
        {/* {!settings.hideGuidePopup && <GuidePopup />} */}
      </div>
    </DefaultTemplate>
  );
}
