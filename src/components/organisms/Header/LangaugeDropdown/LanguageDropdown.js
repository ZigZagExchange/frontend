import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import useTheme from "components/hooks/useTheme";
import classNames from "classnames";
import i18next from "i18next";

import en from "assets/images/en.svg";
import cn from "assets/images/cn.svg";
import ir from "assets/images/ir.svg";
import tr from "assets/images/tr.svg";
import kr from "assets/images/kr.svg";

const languages = [
  {
    code: "en",
    name: "English",
    country_code: "gb",
    icon: en,
  },
  {
    code: "zh",
    name: "中文",
    country_code: "zh",
    icon: cn,
  },
  {
    code: "ir",
    name: "فارسی",
    country_code: "ir",
    icon: ir,
  },
  {
    code: "tr",
    name: "Türkçe",
    country_code: "tr",
    icon: tr,
  },
  {
    code: "kr",
    name: "한국어",
    country_code: "kr",
    icon: kr,
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
          <Listbox.Button className="relative flex items-center w-full gap-2 py-2 pl-3 pr-8 text-sm font-semibold text-left cursor-pointer hover:text-primary-900 font-work dark:text-white-900 text-foreground400 ">
            <img
              src={selected.icon}
              alt={selected.name}
              className="w-5 h-5 rounded-full"
              style={{ width: "1.25rem", height: "1.25rem" }}
            />
            <span className="block truncate">{selected.name}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5 mt-1" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute min-w-max right-0 py-1 mt-1 overflow-auto text-sm dark:bg-[#191A33] border dark:border-foreground-400 bg-sky-100 rounded-md shadow-lg max-h-60">
            {languages.map((lang, langIdx) => (
              <Listbox.Option
                key={langIdx}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 px-4 ${
                    active ? "dark:bg-[#2B2E4A] bg-[#ecf8fa]" : "text-white-900"
                  }`
                }
                value={lang}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`flex items-center gap-2 truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      <img
                        src={lang.icon}
                        alt={lang.name}
                        className="w-5 h-5 rounded-full"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      />
                      {lang.name}
                    </span>
                    {/* {selected ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-900">
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null} */}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
