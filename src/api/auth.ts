import { apiClient } from './client';

export interface GoogleLoginResponse {
  memberId: number;
  accessToken: string;
  refreshToken: string;
  isNewMember: boolean;
  profileCompleted: boolean;
}

export const postGoogleLogin = async (idToken: string): Promise<GoogleLoginResponse> => {
  const { data } = await apiClient.post<GoogleLoginResponse>('/api/auth/login/google', { idToken });
  return data;
};

export const postLogout = async (): Promise<{ message: string }> => {
  const { data } = await apiClient.post<{ message: string }>('/api/auth/logout');
  return data;
};
