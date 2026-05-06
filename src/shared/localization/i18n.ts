import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
// We'll create these files next
const resources = {
  en: {
    translation: {
      welcome: "Welcome to CareBridge",
      // Add more English translations here
    },
  },
  am: {
    translation: {
      welcome: "እንኳን ወደ ኬርብሪጅ በደህና መጡ",
      // Add more Amharic translations here
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0].languageCode ?? "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
