'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';

const localeNames: Record<string, string> = {
  tr: '🇹🇷 TR',
  en: '🇬🇧 EN',
  de: '🇩🇪 DE',
  es: '🇪🇸 ES',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('language');
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchTo(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-voxreal-50 dark:hover:bg-voxreal-900/30 transition-colors flex items-center gap-1"
        title={t('switchTo')}
      >
        {localeNames[locale]}
        <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-xl bg-card dark:bg-card-dark border border-voxreal-200/50 dark:border-voxreal-800/50 shadow-xl overflow-hidden z-50">
          {Object.entries(localeNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => switchTo(code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                code === locale
                  ? 'bg-voxreal-100 dark:bg-voxreal-900/40 font-semibold text-voxreal-700 dark:text-voxreal-300'
                  : 'hover:bg-voxreal-50 dark:hover:bg-voxreal-900/20 text-text-muted dark:text-text-muted-dark'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
