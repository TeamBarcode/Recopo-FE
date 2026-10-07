import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { clearRefreshToken, getRefreshToken, useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

// 토큰재발급 요청은 accessToken이 필요 없고, apiClient의 interceptor를 타면
// 401 처리 중에 또 401을 만나는 순환이 생길 수 있어서 별도 인스턴스로 분리
const refreshClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// 여러 요청이 동시에 401을 받아도 재발급은 한 번만 실행되도록, 진행 중인 재발급 요청을 공유
let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('refreshToken이 없습니다.');
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ accessToken: string }>('/api/auth/token/refresh', { refreshToken })
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken);
        // refreshToken 자체는 rotate 안 되므로(BE 확인 완료) 기존 값 그대로 유지
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAccessToken();
      clearRefreshToken();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  },
);
