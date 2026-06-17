'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiPost } from '@/lib/api';

interface PollCardProps {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  totalVotes: number;
  userVote?: string | null;
  onVote?: (optionLabel: string) => void;
  onSkip?: () => void;
  onVoteComplete?: () => void;
  category?: string;
  userId?: string;
  createdAt?: string;
}

export default function PollCard({
  id,
  question,
  options: initialOptions,
  userVote: propUserVote,
  onVote: propOnVote,
  onSkip,
  onVoteComplete,
  category,
  userId,
  createdAt,
}: PollCardProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('poll');

  const [localVote, setLocalVote] = useState<string | null>(null);
  const [localOptions, setLocalOptions] = useState(initialOptions);
  const [flashOption, setFlashOption] = useState<string | null>(null);
  const [animPercentages, setAnimPercentages] = useState<Record<string, number>>({});
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const userVote = localVote ?? propUserVote ?? null;
  const options = localVote ? localOptions : initialOptions;
  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const voteMutation = useMutation({
    mutationFn: (optionLabel: string) =>
      apiPost(`/api/polls/${id}/vote`, { optionLabel }),
    onMutate: async (optionLabel) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['poll', id] });

      const previousFeed = queryClient.getQueriesData({ queryKey: ['feed'] });
      const previousPoll = queryClient.getQueryData(['poll', id]);

      setLocalVote(optionLabel);
      setLocalOptions((prev) =>
        prev.map((o) =>
          o.label === optionLabel ? { ...o, votes: o.votes + 1 } : o
        )
      );

      return { previousFeed, previousPoll };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['poll', id] });
    },
    onError: (_err, _optionLabel, context) => {
      setLocalVote(null);
      setLocalOptions(initialOptions);
      if (context?.previousFeed) {
        for (const [key, data] of context.previousFeed) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousPoll) {
        queryClient.setQueryData(['poll', id], context.previousPoll);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['poll', id] });
    },
  });

  const handleVote = useCallback(
    (optionLabel: string) => {
      if (userVote) return;
      propOnVote?.(optionLabel);
      voteMutation.mutate(optionLabel);
    },
    [userVote, propOnVote, voteMutation]
  );

  // After vote: flash selected option, animate percentages, auto-advance
  useEffect(() => {
    if (!localVote) return;

    // Flash the selected option green
    setFlashOption(localVote);

    // Calculate target percentages from post-vote counts
    const currentTotal = localOptions.reduce((sum, o) => sum + o.votes, 0);
    const targets: Record<string, number> = {};
    localOptions.forEach((o) => {
      targets[o.label] = currentTotal > 0 ? Math.round((o.votes / currentTotal) * 100) : 0;
    });

    // Animate percentages from 0 → target using requestAnimationFrame
    const startTime = Date.now();
    const duration = 800; // ms
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const current: Record<string, number> = {};
      localOptions.forEach((o) => {
        current[o.label] = Math.round(targets[o.label] * eased);
      });
      setAnimPercentages(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);

    // Stop flash highlight after 500ms
    const flashTimer = setTimeout(() => setFlashOption(null), 500);

    // Auto-advance to next poll after 2 seconds
    autoAdvanceTimerRef.current = setTimeout(() => {
      onVoteComplete?.();
    }, 2000);

    return () => {
      clearTimeout(flashTimer);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Reset internal state when poll id changes
  useEffect(() => {
    setLocalVote(null);
    setLocalOptions(initialOptions);
    setFlashOption(null);
    setAnimPercentages({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="relative h-full w-full flex flex-col bg-surface dark:bg-surface-dark overflow-hidden">
      {/* ── Top: Category + User ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-voxreal-500 dark:text-voxreal-400 bg-voxreal-100/50 dark:bg-voxreal-900/30 px-3 py-1 rounded-full">
            {category || (createdAt ? new Date(createdAt).toLocaleDateString() : '')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {userId && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-voxreal-500 to-purple-mid flex items-center justify-center text-white text-xs font-bold shadow-md">
                {userId.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-text-muted dark:text-text-muted-dark font-medium">
                @{userId.length > 10 ? userId.slice(0, 8) + '…' : userId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Center: Question + Options ──────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 gap-8 max-w-lg mx-auto w-full min-h-0">
        {/* Question */}
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug text-center px-2">
          {question}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const percentage = userVote
              ? (animPercentages[option.label] ??
                  (localVote
                    ? option.votes > 0
                      ? Math.round((option.votes / totalVotes) * 100)
                      : 0
                    : 0))
              : 0;
            const isVoted = userVote === option.label;
            const isFlashing = flashOption === option.label;

            return (
              <button
                key={option.label}
                onClick={() => handleVote(option.label)}
                disabled={!!userVote || voteMutation.isPending}
                className={`
                  relative w-full overflow-hidden text-left
                  transition-all duration-300 ease-out
                  min-h-[60px] rounded-2xl
                  ${
                    isVoted && isFlashing
                      ? 'ring-2 ring-success bg-success/15 dark:bg-success/25 flash-green !ring-success'
                      : isVoted
                      ? 'ring-2 ring-success bg-success/10 dark:bg-success/20'
                      : userVote
                      ? 'opacity-50 cursor-not-allowed'
                      : 'bg-card dark:bg-card-dark border border-voxreal-200/50 dark:border-voxreal-800/50 hover:border-voxreal-400 dark:hover:border-voxreal-600 active:scale-[0.98]'
                  }
                `}
              >
                {/* Animated progress bar background */}
                {userVote && (
                  <div
                    className={`absolute inset-0 rounded-2xl transition-all duration-300 ease-out ${
                      isVoted
                        ? 'bg-success/15 dark:bg-success/25'
                        : 'bg-voxreal-500/10 dark:bg-voxreal-500/20'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between px-5 min-h-[60px]">
                  <span
                    className={`font-semibold text-base ${
                      isVoted ? 'text-success font-bold' : ''
                    }`}
                  >
                    {option.label}
                  </span>
                  {userVote && (
                    <span
                      className={`font-bold text-sm tabular-nums ${
                        isVoted
                          ? 'text-success'
                          : 'text-text-muted dark:text-text-muted-dark'
                      }`}
                    >
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom: Skip + Vote Count + Bar ─────────────────────── */}
      <div className="px-6 pb-8 pt-3 z-10 max-w-lg mx-auto w-full shrink-0">
        <div className="flex items-center justify-between mb-3">
          {/* Skip / Next button */}
          <button
            onClick={onSkip}
            disabled={!onSkip}
            className={`
              text-sm font-medium px-4 py-2 rounded-full transition-all duration-200
              ${
                onSkip
                  ? 'text-text-muted dark:text-text-muted-dark hover:text-voxreal-500 dark:hover:text-voxreal-400 active:scale-95'
                  : 'text-text-muted/40 dark:text-text-muted-dark/40 cursor-not-allowed'
              }
            `}
          >
            {userVote ? `${t('skip')} →` : `${t('skip')} →`}
          </button>

          {/* Vote count */}
          <span className="text-xs text-text-muted dark:text-text-muted-dark tabular-nums">
            {t('votes', { count: totalVotes })}
          </span>
        </div>

        {/* Live percentage bar (appears after vote) */}
        {userVote && (
          <div className="h-1.5 w-full bg-voxreal-200/50 dark:bg-voxreal-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-voxreal-500 to-purple-mid rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  Object.values(animPercentages).length > 0
                    ? Math.max(...Object.values(animPercentages))
                    : 0
                }%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
