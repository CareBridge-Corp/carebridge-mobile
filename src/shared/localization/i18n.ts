import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import commonAm from "./locales/am/common.json";
import commonEn from "./locales/en/common.json";
import commonOm from "./locales/om/common.json";

const resources = {
  en: {
    translation: commonEn,
  },
  am: {
    translation: commonAm,
  },
  om: {
    translation: commonOm,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0].languageCode ?? "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
