import React, { useState } from "react";
import { Listbox as ListBoxSelect, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

const ListBox = ({ options, setSelectedItem, selectedItem }) => {
  // const [selectedItem, setSelectedItem] = useState(options[0]);

  return (
    <ListBoxSelect value={selectedItem} onChange={setSelectedItem}>
      <ListBoxSelect.Button className="relative dark:bg-foreground-200 bg-primary-300 w-full text-left py-2 pl-3 pr-10  rounded-lg text-sm">
        <span>{selectedItem.name}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

export default ListBox;
