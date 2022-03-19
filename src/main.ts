import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faCog,
  faQuestionCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import App from "./App.vue";
import router from "./router";
import {
  loadLocaleMessages,
  setI18nLanguage,
  setupI18n,
  SUPPORT_LOCALES,
  getBrowserLocale,
} from "./i18n";

library.add(faCog, faQuestionCircle, faSpinner);

const app = createApp(App);
const i18n = setupI18n();
router.beforeEach(async (to, from, next) => {
  const currentLocal = localStorage.getItem("locale") || getBrowserLocale();
  const paramsLocale = Array.isArray(to.params.locale)
    ? to.params.locale[0]
    : to.params.locale;

  if (paramsLocale !== undefined) {
    // use locale if paramsLocale is not in SUPPORT_LOCALES
    if (!SUPPORT_LOCALES.includes(paramsLocale)) {
      return next(`/${currentLocal}`);
    }
    setI18nLanguage(i18n, paramsLocale);
  }
  if (!i18n.global.availableLocales.includes(i18n.global.locale.value)) {
    await loadLocaleMessages(i18n, i18n.global.locale.value);
  }
  // set i18n language

  return next();
});
app.use(router);
app.use(i18n);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
