import { create } from 'zustand';

import type { MyProfile } from '@/api/member';

interface MyProfileState {
  profile: MyProfile | null;
  setProfile: (profile: MyProfile) => void;
  patchProfile: (partial: Partial<MyProfile>) => void;
  clearProfile: () => void;
}

// 헤더(프로필 이미지)와 마이페이지가 같은 내 정보를 보여줘야 해서 공유함
export const useMyProfileStore = create<MyProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  patchProfile: (partial) =>
    set((state) => (state.profile ? { profile: { ...state.profile, ...partial } } : state)),
  clearProfile: () => set({ profile: null }),
}));
