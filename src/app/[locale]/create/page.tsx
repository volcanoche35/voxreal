'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiGet, apiPost, FetchError } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export default function CreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('create');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<{ success: boolean; data: Category[] }>('/api/categories'),
  });

  useEffect(() => {
    if (categories?.data?.length && !selectedCategoryId) {
      setSelectedCategoryId(categories.data[0].id);
    }
  }, [categories, selectedCategoryId]);

  const createMutation = useMutation({
    mutationFn: (data: { question: string; options: string[]; categoryId: string }) =>
      apiPost('/api/polls', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.push('/feed');
    },
    onError: (error: FetchError) => {
      setErrorMessage(error.message || t('failedToCreate'));
    },
  });

  const addOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!trimmedQuestion || trimmedOptions.length < 2 || !selectedCategoryId) return;
    createMutation.mutate({
      question: trimmedQuestion,
      options: trimmedOptions,
      categoryId: selectedCategoryId,
    });
  };

  const isValid = question.trim() && options.filter((o) => o.trim()).length >= 2 && selectedCategoryId;

  return (
    <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-sm text-text-muted">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted">{t('category')}</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full rounded-2xl border-2 border-voxreal-200 dark:border-voxreal-800 bg-card dark:bg-card-dark px-5 py-4 text-base font-medium focus:outline-none focus:border-voxreal-500 transition-colors"
          >
            {categories?.data?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted">{t('question')}</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('questionPlaceholder')}
            rows={3}
            maxLength={200}
            className="w-full rounded-2xl border-2 border-voxreal-200 dark:border-voxreal-800 bg-card dark:bg-card-dark px-5 py-4 text-base font-medium placeholder:text-text-muted focus:outline-none focus:border-voxreal-500 transition-colors resize-none"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{question.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted">{t('options')}</label>
          <div className="flex flex-col gap-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-voxreal-100 dark:bg-voxreal-900 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-voxreal-600 dark:text-voxreal-400">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={t('optionPlaceholder', { n: index + 1 })}
                  maxLength={100}
                  className="flex-1 rounded-xl border-2 border-voxreal-200 dark:border-voxreal-800 bg-card dark:bg-card-dark px-4 py-3 text-base font-medium placeholder:text-text-muted focus:outline-none focus:border-voxreal-500 transition-colors"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors flex items-center justify-center shrink-0"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 w-full rounded-xl border-2 border-dashed border-voxreal-300 dark:border-voxreal-700 px-4 py-3 text-sm font-semibold text-voxreal-600 dark:text-voxreal-400 hover:bg-voxreal-50 dark:hover:bg-voxreal-900/20 transition-colors"
            >
              {t('addOption')}
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || createMutation.isPending}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
            isValid && !createMutation.isPending
              ? 'bg-gradient-to-r from-voxreal-600 to-purple-mid text-white shadow-lg shadow-voxreal-500/30 hover:shadow-xl hover:shadow-voxreal-500/40 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-voxreal-200 dark:bg-voxreal-800 text-voxreal-400 cursor-not-allowed'
          }`}
        >
          {createMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('creating')}
            </span>
          ) : (
            t('publish')
          )}
        </button>
      </form>
    </div>
  );
}
