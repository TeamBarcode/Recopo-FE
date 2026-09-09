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

// ===== 회원 검색 (친구 추가용) =====
export interface SearchedMember {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  // 명세 예시엔 'NONE'만 나와있어서 다른 값(요청됨/이미 친구 등)의 정확한 문자열은 확인 필요
  friendStatus: string;
}

export interface MemberSearchResponse {
  members: SearchedMember[];
}

export const getMemberSearch = async (nickname: string): Promise<MemberSearchResponse> => {
  const { data } = await apiClient.get<MemberSearchResponse>('/api/members/search', {
    params: { nickname },
  });
  return data;
};
