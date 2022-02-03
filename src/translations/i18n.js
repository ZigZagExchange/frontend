import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { EN_TRANSLATIONS_EN } from "./en/en_translations";
import { ZH_TRANSLATIONS_ZH } from "./zh/zh_translations";

i18n
 .use(LanguageDetector)
 .use(initReactI18next)
 .init({
   resources: {
     en: {
       translation: EN_TRANSLATIONS_EN
     },
     zh: {
       translation: ZH_TRANSLATIONS_ZH
     }
   }
 });
 
i18n.changeLanguage("zh");