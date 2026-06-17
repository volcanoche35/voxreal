'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const t = useTranslations('home');
  useEffect(() => { setLoaded(true); }, []);

  const features = [
    { emoji: '📊', key: 'create' },
    { emoji: '📱', key: 'share' },
    { emoji: '📈', key: 'analyze' },
  ] as const;

  return (
    <div className={`flex-1 flex flex-col ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-voxreal-100/40 via-transparent to-purple-dark/5 dark:from-voxreal-950/30 dark:via-transparent dark:to-purple-dark/20 pointer-events-none" />
        <div className="absolute top-1/4 w-[400px] h-[400px] bg-voxreal-500/10 dark:bg-voxreal-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-voxreal-500 to-purple-mid flex items-center justify-center shadow-xl shadow-voxreal-500/25 mb-8">
            <span className="text-white font-bold text-4xl">V</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-voxreal-600 via-voxreal-500 to-purple-mid bg-clip-text text-transparent">
              VoxReal
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-text-muted dark:text-text-muted-dark mb-3 font-medium">
            {t('slogan')}
          </p>

          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-10 max-w-sm leading-relaxed">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none">
            <Link
              href="/create"
              className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white font-bold text-lg shadow-lg shadow-voxreal-500/30 hover:shadow-xl hover:shadow-voxreal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
            >
              {t('createPoll')}
            </Link>
            <Link
              href="/feed"
              className="flex-1 px-8 py-4 rounded-xl border-2 border-voxreal-300 dark:border-voxreal-700 text-voxreal-700 dark:text-voxreal-300 font-bold text-lg hover:bg-voxreal-50 dark:hover:bg-voxreal-900/30 active:scale-[0.98] transition-all duration-200 text-center"
            >
              {t('browsePolls')}
            </Link>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-2xl px-4">
          {features.map((feature, i) => (
            <div
              key={feature.key}
              className="card-enter bg-card dark:bg-card-dark rounded-2xl p-5 border border-voxreal-200/50 dark:border-voxreal-800/50 hover:border-voxreal-400 dark:hover:border-voxreal-600 transition-all duration-200"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="text-2xl mb-2">{feature.emoji}</div>
              <h3 className="font-bold text-sm mb-1">
                {t(`features.${feature.key}.title`)}
              </h3>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
                {t(`features.${feature.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
