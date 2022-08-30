import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid";
import useTheme from "components/hooks/useTheme";
import classNames from "classnames";
import i18next from "i18next";
const languages = [
  {
    code: "en",
    name: "EN",
    country_code: "gb",
  },
  {
    code: "zh",
    name: "CHN",
    country_code: "zh",
  },
];

export default function LanguageDropdown() {
  const [selected, setSelected] = useState(languages[0]);
  const { isDark } = useTheme();
  const onChangeLanguage = (option) => {
    i18next.changeLanguage(option.code);
    setSelected(option);
  };

  return (
    <div className={classNames({ dark: isDark })}>
      <Listbox value={selected} onChange={onChangeLanguage}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full py-2 pl-3 pr-8 text-sm font-semibold text-left cursor-pointer hover:text-primary-900 font-work dark:text-white-900 text-foreground400 ">
            <span className="block truncate">{selected.name}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5 mt-1" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute w-26 py-1 mt-1 overflow-auto text-sm dark:bg-[#191A33] border dark:border-foreground-400 bg-sky-100 rounded-md shadow-lg max-h-60">
              {languages.map((lang, langIdx) => (
                <Listbox.Option
                  key={langIdx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active
                        ? "dark:bg-[#2B2E4A] bg-[#ecf8fa]"
                        : "text-white-900"
                    }`
                  }
                  value={lang}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {lang.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-900">
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
