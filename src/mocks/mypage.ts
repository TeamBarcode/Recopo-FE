import { type User, mockUser } from './user';
import { type IdeaCard, mockIdeaCards } from './ideaCards';

// ===== 닉네임 변경 =====
export interface UpdateNicknameRequest {
  nickname: string;
}

export const updateMockNickname = async (
  request: UpdateNicknameRequest
): Promise<User> => {
  await new Promise((r) => setTimeout(r, 500));

  return {
    ...mockUser,
    nickname: request.nickname,
  };
};

// ===== 아이디 변경 =====
export interface UpdateUserIdRequest {
  userId: string;
}

export interface UpdateUserIdErrorResponse {
  errorCode: 'ID_ALREADY_EXISTS';
  message: string;
}

export const mockUserIdErrorExists: UpdateUserIdErrorResponse = {
  errorCode: 'ID_ALREADY_EXISTS',
  message: '이미 사용 중인 아이디예요',
};

const EXISTING_USER_ID = 'existinguser';

export const updateMockUserId = async (
  request: UpdateUserIdRequest
): Promise<User> => {
  await new Promise((r) => setTimeout(r, 500));

  if (request.userId === EXISTING_USER_ID) {
    throw mockUserIdErrorExists;
  }

  return {
    ...mockUser,
    userId: request.userId,
  };
};

// ===== 프로필 사진 삭제 =====
export const deleteMockProfileImage = async (): Promise<User> => {
  await new Promise((r) => setTimeout(r, 300));

  return {
    ...mockUser,
    profileImageUrl: undefined,
  };
};

// ===== 개인정보 조회 =====
export const fetchMockAccountInfo = async (): Promise<{ email: string }> => {
  await new Promise((r) => setTimeout(r, 300));

  return { email: mockUser.email };
};

// ===== 이메일 변경 =====
export interface UpdateEmailRequest {
  email: string;
}

export interface UpdateEmailErrorResponse {
  errorCode: 'EMAIL_ALREADY_EXISTS';
  message: string;
}

export const mockEmailErrorExists: UpdateEmailErrorResponse = {
  errorCode: 'EMAIL_ALREADY_EXISTS',
  message: '현재 사용 중인 이메일 주소예요',
};

const EXISTING_EMAIL = 'existing@ewha.ac.kr';

export const updateMockEmail = async (
  request: UpdateEmailRequest
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 500));

  if (request.email === EXISTING_EMAIL) {
    throw mockEmailErrorExists;
  }

  return { success: true };
};

// ===== 비밀번호 변경 =====
export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdatePasswordErrorResponse {
  errorCode: 'WRONG_OLD_PASSWORD' | 'SAME_AS_OLD_PASSWORD';
  message: string;
}

export const mockPasswordErrorWrong: UpdatePasswordErrorResponse = {
  errorCode: 'WRONG_OLD_PASSWORD',
  message: '이전 비밀번호가 틀려요',
};

export const mockPasswordErrorSame: UpdatePasswordErrorResponse = {
  errorCode: 'SAME_AS_OLD_PASSWORD',
  message: '이전 비밀번호와 동일해요',
};

const CURRENT_PASSWORD = 'test1234!';

export const updateMockPassword = async (
  request: UpdatePasswordRequest
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 500));

  if (request.oldPassword !== CURRENT_PASSWORD) {
    throw mockPasswordErrorWrong;
  }
  if (request.newPassword === request.oldPassword) {
    throw mockPasswordErrorSame;
  }

  return { success: true };
};

// ===== 좋아요한 아이디어 목록 조회 =====
export const fetchMockLikedIdeas = async (): Promise<IdeaCard[]> => {
  await new Promise((r) => setTimeout(r, 300));

  return mockIdeaCards.filter((idea) => idea.likedByMe);
};

// ===== 좋아요 취소 =====
export const unlikeMockIdea = async (
  ideaId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 300));

  const exists = mockIdeaCards.some((idea) => idea.id === ideaId);
  if (!exists) {
    throw { message: '존재하지 않는 아이디어예요' };
  }

  return { success: true };
};