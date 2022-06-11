import React, { useState } from "react";
import useTheme from "components/hooks/useTheme";
import { DefaultTemplate } from "components";
import BridgeContainer from "./BridgeContainer";
import TransferHistory from "./TransferHistory";
import classNames from "classnames";

import { LoadingSpinner } from "components/atoms/LoadingSpinner";

import { Tab } from "@headlessui/react";

const tabList = ["Bridge", "Transfer History"];

export default function BridgePage() {
  // const isSwapCompatible = useMemo(
  //   () => network && api.isImplemented("depositL2"),
  //   [network]
  // );
  // const tab = useParams().tab || "swap";

  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  return (
    <DefaultTemplate>
      {loading && (
        <div
          className={classNames("flex justify-center align-center mt-48", {
            dark: isDark,
          })}
        >
          <LoadingSpinner />
        </div>
      )}
      {!loading && (
        <div className={classNames("flex justify-center", { dark: isDark })}>
          <div className="w-full max-w-lg px-1 sm:px-0">
            <p className="mt-20 text-3xl font-semibold ">ZigZag Bridge</p>
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
                              : "text-gray-500 "
                          )
                        }
                      >
                        {item}
                      </Tab>
                    );
                  })}
                </Tab.List>
                <Tab.Panels className="mt-2">
                  <Tab.Panel>
                    <BridgeContainer />
                  </Tab.Panel>
                  <Tab.Panel>
                    <TransferHistory />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      )}
    </DefaultTemplate>
  );
}
