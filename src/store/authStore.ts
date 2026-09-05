import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
}

// accessToken은 수명이 짧고 매 요청마다 쓰여서 메모리(zustand)에만 둠 — 새로고침하면 사라짐
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
}));

const REFRESH_TOKEN_KEY = 'recopo_refresh_token';

// refreshToken은 새로고침/브라우저 재시작에도 로그인이 유지돼야 해서 localStorage에 둠
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const clearRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN_KEY);
