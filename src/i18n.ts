import { nextTick } from 'vue'
import { createI18n, type I18n } from 'vue-i18n'

export const SUPPORT_LOCALES = ['en', 'fr']

export function setupI18n(
    locale = "fr",
    fallbackLocale = "fr",
    messages = {},
    datetimeFormats = {},
    numberFormats = {}
  ) {
    const i18n = createI18n({
      locale,
      fallbackLocale,
      messages,
      datetimeFormats,
      numberFormats,
      legacy: false,
    });
    setI18nLanguage(i18n, locale);
    return i18n;
  }

export function setI18nLanguage(i18n: I18n<{}, {}, {}, false>, locale: string) {
  i18n.global.locale.value = locale
  document.querySelector('html')?.setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n: I18n<{}, {}, {}, false>, locale: string) {
  // load locale messages with dynamic import
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`
  )

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)

  return nextTick()
}

export function getBrowserLocale(countryCodeOnly = true) {
    const navigatorLocale =
      navigator.languages !== undefined
        ? navigator.languages[0]
        : navigator.language;
  
    if (!navigatorLocale) {
      return "fr";
    }
  
    const trimmedLocale = countryCodeOnly
      ? navigatorLocale.trim().split(/-|_/)[0]
      : navigatorLocale.trim();
  
    return trimmedLocale;
  }