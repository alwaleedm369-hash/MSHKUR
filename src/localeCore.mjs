export function resolveLocale(saved) {
  return saved === 'ar' ? 'ar' : 'en';
}

export function getDirection(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function translateText(value, locale, dictionary = {}) {
  if (locale === 'ar') return value;
  return dictionary[value.trim()] || value;
}
