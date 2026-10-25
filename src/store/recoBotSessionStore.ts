import { create } from 'zustand';

import type { RecommendationSortOption, RecommendedRepository } from '@/mocks/recobot';

// RecoBotPanel은 홈/기록상세 등 여러 페이지에 걸쳐 렌더링되는데,
// 페이지 이동으로 컴포넌트가 언마운트/재마운트돼도 진행 중이던 추천 세션이
// 초기화되지 않도록 컴포넌트 로컬 state가 아니라 이 전역 store에 둠.

export interface AttachedCard {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  // 이미 보관된 추천이 있는 카드에서 다시 추천받을 때, 같은 레포를 또 받지 않도록 제외할 레포 id
  excludedRepositoryIds?: number[];
}

export interface ResultItem {
  recommendationId: number;
  repository: RecommendedRepository;
}

export type PanelState =
  | { phase: 'idle' }
  | { phase: 'sending' }
  | { phase: 'result'; items: ResultItem[] }
  | { phase: 'error'; message: string };

interface RecoBotSessionState {
  attachedCard: AttachedCard | null;
  sentCard: AttachedCard | null;
  panelState: PanelState;
  selectedRepositoryId: number | null;
  selectedSort: RecommendationSortOption | null;
  setAttachedCard: (card: AttachedCard | null) => void;
  setSentCard: (card: AttachedCard | null) => void;
  setPanelState: (state: PanelState) => void;
  setSelectedRepositoryId: (id: number | null) => void;
  setSelectedSort: (sort: RecommendationSortOption | null) => void;
  resetSession: () => void;
}

export const useRecoBotSessionStore = create<RecoBotSessionState>((set) => ({
  attachedCard: null,
  sentCard: null,
  panelState: { phase: 'idle' },
  selectedRepositoryId: null,
  selectedSort: null,
  setAttachedCard: (card) => set({ attachedCard: card }),
  setSentCard: (card) => set({ sentCard: card }),
  setPanelState: (state) => set({ panelState: state }),
  setSelectedRepositoryId: (id) => set({ selectedRepositoryId: id }),
  setSelectedSort: (sort) => set({ selectedSort: sort }),
  resetSession: () =>
    set({
      attachedCard: null,
      sentCard: null,
      panelState: { phase: 'idle' },
      selectedRepositoryId: null,
    }),
}));
