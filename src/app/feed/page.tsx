'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import PollCard from '@/components/PollCard';
import Link from 'next/link';
import { apiGet, type FeedResponse, FetchError } from '@/lib/api';

const FEED_LIMIT = 10;

export default function FeedPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedIndices, setVotedIndices] = useState<Set<number>>(new Set());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<FeedResponse, FetchError>({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => {
      const cursor = pageParam
        ? `?cursor=${pageParam}&limit=${FEED_LIMIT}`
        : `?limit=${FEED_LIMIT}`;
      return apiGet<FeedResponse>(`/api/feed${cursor}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
  });

  // Infinite scroll: observe sentinel at the bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Track current visible poll via IntersectionObserver on snap items
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(
              entry.target.getAttribute('data-index') || '0',
              10
            );
            setCurrentIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );

    const observeChildren = () => {
      observer.disconnect();
      const items = container.querySelectorAll('[data-index]');
      items.forEach((item) => observer.observe(item));
    };

    observeChildren();

    // Re-observe when new items are added (infinite scroll)
    const mutationObserver = new MutationObserver(observeChildren);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const polls = data?.pages.flatMap((page) => page.polls) ?? [];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < polls.length - 1;

  // Scroll to a specific poll index
  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const item = container.querySelector(`[data-index="${index}"]`);
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Auto-advance to next poll after vote
  const handleVoteComplete = useCallback(() => {
    if (hasNext) {
      scrollToIndex(currentIndex + 1);
    }
  }, [hasNext, currentIndex, scrollToIndex]);

  // Skip to next poll
  const handleSkip = useCallback(() => {
    if (hasNext) {
      scrollToIndex(currentIndex + 1);
    }
  }, [hasNext, scrollToIndex, currentIndex]);

  // Track which polls were voted on (for skip label)
  const handleVote = useCallback(
    (_optionLabel: string) => {
      setVotedIndices((prev) => new Set(prev).add(currentIndex));
    },
    [currentIndex]
  );

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Feed Counter (top-right overlay) */}
      <div className="absolute top-4 right-4 z-20">
        <span className="text-xs font-medium text-text-muted dark:text-text-muted-dark bg-surface/60 dark:bg-surface-dark/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-voxreal-200/50 dark:border-voxreal-800/50">
          {polls.length > 0 ? `${currentIndex + 1} / ${polls.length}` : '—'}
        </span>
      </div>

      {/* TikTok-style vertical snap feed */}
      <div
        ref={containerRef}
        className="feed-scroll snap-y snap-mandatory overflow-y-scroll h-[calc(100vh-3.5rem)]"
      >
        {/* Loading state */}
        {isLoading && (
          <div className="snap-start h-[calc(100vh-3.5rem)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-voxreal-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm text-text-muted dark:text-text-muted-dark">
                Yükleniyor...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="snap-start h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-xl font-bold mb-2">
                Anketler yüklenemedi
              </h2>
              <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">
                {error?.message || 'Bir şeyler yanlış gitti'}
              </p>
              <button
                onClick={() => fetchNextPage()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && polls.length === 0 && (
          <div className="snap-start h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-bold mb-2">Henüz anket yok</h2>
              <p className="text-sm text-text-muted dark:text-text-muted-dark mb-6">
                İlk anketi sen oluştur!
              </p>
              <Link
                href="/create"
                className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Anket Oluştur
              </Link>
            </div>
          </div>
        )}

        {/* Poll list — each poll is a full-screen snap section */}
        {polls.map((poll, index) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
          const isLast = index === polls.length - 1;

          return (
            <section
              key={poll.id}
              data-index={index}
              className="snap-start h-[calc(100vh-3.5rem)] overflow-hidden"
            >
              <PollCard
                id={poll.id}
                question={poll.question}
                options={poll.options}
                totalVotes={totalVotes}
                userId={poll.userId}
                createdAt={poll.createdAt}
                onVote={handleVote}
                onSkip={!isLast ? handleSkip : undefined}
                onVoteComplete={!isLast ? handleVoteComplete : undefined}
              />
            </section>
          );
        })}

        {/* Sentinel for infinite scroll */}
        <div
          ref={sentinelRef}
          className="snap-start h-16 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <svg
              className="animate-spin h-6 w-6 text-voxreal-400"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {!hasNextPage && polls.length > 0 && (
            <p className="text-xs text-text-muted dark:text-text-muted-dark">
              Tüm anketleri gördün
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
