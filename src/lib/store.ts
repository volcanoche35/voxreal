import { create } from 'zustand';

export interface PollOption {
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: number;
  userId?: string;
}

export interface UserVote {
  pollId: string;
  optionLabel: string;
}

interface PollStore {
  polls: Poll[];
  votes: Record<string, string>; // pollId -> optionLabel
  isLoading: boolean;
  error: string | null;

  setPolls: (polls: Poll[]) => void;
  addPoll: (poll: Poll) => void;
  vote: (pollId: string, optionLabel: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePollStore = create<PollStore>((set) => ({
  polls: [],
  votes: {},
  isLoading: false,
  error: null,

  setPolls: (polls) => set({ polls }),
  addPoll: (poll) => set((state) => ({ polls: [poll, ...state.polls] })),
  vote: (pollId, optionLabel) =>
    set((state) => ({
      votes: { ...state.votes, [pollId]: optionLabel },
      polls: state.polls.map((p) =>
        p.id === pollId
          ? {
              ...p,
              options: p.options.map((o) =>
                o.label === optionLabel ? { ...o, votes: o.votes + 1 } : o
              ),
            }
          : p
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// UI Store
interface UIStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));
