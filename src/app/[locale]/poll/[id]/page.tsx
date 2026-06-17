'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import PollCard from '@/components/PollCard';
import { Link } from '@/i18n/navigation';
import { apiGet, type Poll, FetchError } from '@/lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PollPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations('poll');
  const tf = useTranslations('feed');

  const {
    data: poll,
    isLoading,
    isError,
    error,
  } = useQuery<Poll, FetchError>({
    queryKey: ['poll', id],
    queryFn: () => apiGet<Poll>(`/api/polls/${id}`),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-voxreal-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">{tf('loading')}</p>
        </div>
      </div>
    );
  }

  if (isError || !poll) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-surface dark:bg-surface-dark">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">{t('notFound')}</h1>
          <p className="text-text-muted dark:text-text-muted-dark mb-6">
            {error?.message || t('notFoundDesc')}
          </p>
          <Link
            href="/feed"
            className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {t('browsePolls')}
          </Link>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-surface dark:bg-surface-dark">
      <Link
        href="/feed"
        className="absolute top-16 left-4 z-20 text-sm text-text-muted dark:text-text-muted-dark hover:text-voxreal-500 dark:hover:text-voxreal-400 transition-colors flex items-center gap-1.5 bg-surface/60 dark:bg-surface-dark/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-voxreal-200/50 dark:border-voxreal-800/50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
        <PollCard
          id={poll.id}
          question={poll.question}
          options={poll.options}
          totalVotes={totalVotes}
          userId={poll.userId}
          createdAt={poll.createdAt}
        />
      </div>
    </div>
  );
}
