import { apiClient } from './client';

export interface ProfileSetupRequest {
  loginId: string;
  nickname: string;
}

export interface ProfileSetupResponse {
  memberId: number;
  loginId: string;
  nickname: string;
  profileImageUrl: string;
  profileCompleted: boolean;
}

export const patchProfileSetup = async (
  request: ProfileSetupRequest,
): Promise<ProfileSetupResponse> => {
  const { data } = await apiClient.patch<ProfileSetupResponse>('/api/members/me/profile', request);
  return data;
};

export interface CheckLoginIdResponse {
  loginId: string;
  available: boolean;
}

export const getCheckLoginId = async (loginId: string): Promise<CheckLoginIdResponse> => {
  const { data } = await apiClient.get<CheckLoginIdResponse>('/api/members/check-login-id', {
    params: { loginId },
  });
  return data;
};

export interface ProfileImageResponse {
  memberId: number;
  profileImageUrl: string;
  updatedAt: string;
}

export const putProfileImage = async (file: File): Promise<ProfileImageResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  // Content-Type은 axios/브라우저가 FormData 보고 boundary 포함해서 자동 설정 — 직접 지정하지 않음
  const { data } = await apiClient.put<ProfileImageResponse>('/api/members/me/profile-image', formData);
  return data;
};
