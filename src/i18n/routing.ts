import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'en', 'de', 'es'],
  defaultLocale: 'tr',
  localePrefix: 'always'
});
