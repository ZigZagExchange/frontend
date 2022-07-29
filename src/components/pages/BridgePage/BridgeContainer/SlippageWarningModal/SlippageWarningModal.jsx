import React, { useState } from "react";
import classNames from "classnames";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, SaveAsIcon } from "@heroicons/react/solid";
import { AiOutlineWarning } from "react-icons/ai";
import useTheme from "components/hooks/useTheme";
import { Fragment } from "react";

const SlippageWarningModal = ({
  isOpen,
  closeModal,
  confirmModal,
  slippage,
}) => {
  const { isDark } = useTheme();
  const [value, setValue] = useState("");
  const onCloseModal = () => {
    setValue("");
    closeModal();
  };

  const onConfirmModal = () => {
    setValue("");
    confirmModal();
  };

  return (
    <div className={classNames({ dark: isDark })}>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            return;
          }}
          static={true}
          unmount={false}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-[#292f49] shadow-2xl rounded-lg border border-foreground-400 relative">
                  <XIcon
                    className="absolute w-5 dark:text-white hover:opacity-75 top-3 right-3"
                    onClick={onCloseModal}
                  />
                  <div className="flex justify-center mt-5 text-center">
                    <AiOutlineWarning size={50} color="#FCC958" />
                  </div>
                  <p className="mt-3 text-xl font-semibold text-center font-work">
                    This transaction has high slippage!
                  </p>
                  <p className="mt-3 text-sm text-center">
                    With your current bridge options, <br></br>this transaction
                    will result in
                  </p>
                  <p className="text-xl font-bold text-center font-work text-[#FCC958] mt-1">
                    {slippage && slippage.toPrecision(4)}% slippage.
                  </p>
                  <p className="mt-3 text-sm text-center">
                    Type{" "}
                    <strong className="font-bold font-work">CONFIRM</strong>{" "}
                    below to continue with the trade.
                  </p>
                  <input
                    value={value}
                    className="w-full px-2 py-1 mt-3 text-lg text-[#FCC958] font-semibold uppercase border rounded-lg font-work bg-foreground-100 focus:outline-none border-foreground-400 text-center"
                    onChange={(e) => setValue(e.target.value)}
                  />
                  <div className="mt-4">
                    <button
                      type="button"
                      className="w-full py-2 text-sm font-semibold uppercase rounded-lg hover:opacity-90 bg-gradient-to-r from-primary-900 to-secondary-900 font-work disabled:opacity-70"
                      onClick={onConfirmModal}
                      disabled={value.toLocaleLowerCase() !== "confirm"}
                    >
                      continue with high slippage
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SlippageWarningModal;
