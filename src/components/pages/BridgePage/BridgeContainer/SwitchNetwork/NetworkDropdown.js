import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Listbox as ListBoxSelect, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { networkSelector } from "lib/store/features/api/apiSlice";
const NetworkDropdown = ({ options, setSelectedItem, selectedItem }) => {
  // const [selectedItem, setSelectedItem] = useState(options[0]);
  const network = useSelector(networkSelector);

  return (
    <ListBoxSelect value={selectedItem} onChange={setSelectedItem}>
      <ListBoxSelect.Button className="relative w-full py-2 pl-3 pr-10 text-sm text-left rounded-lg hover:bg-primary-400 dark:bg-foreground-200 bg-primary-300 hover:dark:bg-foreground-100">
        <div className="flex items-start gap-2">
          <img
            src={selectedItem.icon}
            alt="icon"
            className="rounded-full w-9 h-9"
          />
          <div>
            <p className="text-xs font-bold tracking-wider md:text-base font-work ">
              {selectedItem.name}
            </p>
            <p className="text-xs tracking-wider ">
              {network === 1 ? "Mainnet" : "Testnet"}
            </p>
          </div>
        </div>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListBoxSelect.Button>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <ListBoxSelect.Options className="absolute mt-1 border-l border-r border-t border-b max-h-60 w-full overflow-auto rounded-md  py-1 text-base shadow-lg focus:outline-none dark:bg-[#2B2E4A] bg-sky-100 dark:border-foreground-400">
          {options.map((item, itemIdx) => (
            <ListBoxSelect.Option
              key={itemIdx}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 text-sm ${
                  active ? "bg-primary-200 text-secondary-900" : ""
                }`
              }
              value={item}
            >
              {({ selected }) => (
                <>
                  <span
                    className={`block truncate ${
                      selected ? "font-medium" : "font-normal"
                    }`}
                  >
                    {item.name}
                  </span>
                  {selected ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 ">
                      <CheckIcon className="w-5 h-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </ListBoxSelect.Option>
          ))}
        </ListBoxSelect.Options>
      </Transition>
    </ListBoxSelect>
  );
};

export default NetworkDropdown;
