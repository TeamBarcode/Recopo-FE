import type { IdeaCard, IdeaDetail } from './ideaCards';
import { mockIdeaCards, mockIdeaDetail } from './ideaCards';

// ===== 타입 =====
export interface Friend {
  id: string;
  userId: string;
  nickname: string;
  profileImageUrl?: string;
}

// ===== 목록 mock 데이터 =====
export const mockFriendsSuccess: Friend[] = [
  {
    id: 'friend1',
    userId: 'himdleda',
    nickname: 'himdleda',
    profileImageUrl:
      'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
  },
  {
    id: 'friend2',
    userId: 'appeach',
    nickname: '어피치',
    profileImageUrl:
      'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
  },
  {
    id: 'friend3',
    userId: 'jccredred',
    nickname: 'jccredred',
    profileImageUrl:
      'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
  },
];

export const mockFriendsEmpty: Friend[] = [];

// ===== 친구 목록 조회 (검색 안 했을 때 기본 목록) =====
export const fetchMockFriends = async (): Promise<Friend[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return mockFriendsSuccess;
};

// ===== 친구의 아이디어 목록 조회 (공개된 것만) =====
export const fetchMockFriendsIdeas = async (
  friendId: string, // Friend.id 값 (userId 아님) — ideaCards.ts의 authorId와 이 값으로 매칭됨
  category?: string,
  sortBy?: 'latest' | 'oldest'
): Promise<IdeaCard[]> => {
  await new Promise((r) => setTimeout(r, 300));

  let result = mockIdeaCards.filter(
    (idea) => idea.isPublic && idea.authorId === friendId
  );

  if (category) {
    result = result.filter((idea) => idea.category === category);
  }

  if (sortBy === 'latest') {
    result = result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === 'oldest') {
    result = result.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  return result;
};

// ===== 친구 삭제 =====
export const deleteMockFriend = async (
  friendId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 500));

  const exists = mockFriendsSuccess.some((friend) => friend.id === friendId);
  if (!exists) {
    throw { message: '존재하지 않는 친구예요' };
  }

  return { success: true };
};

// ===== 친구의 아이디어 상세 조회 =====
export const fetchMockFriendIdeaDetail = async (
  ideaId: string
): Promise<IdeaDetail> => {
  await new Promise((r) => setTimeout(r, 300));

  if (mockIdeaDetail.id !== ideaId) {
    throw { message: '존재하지 않는 아이디어예요' };
  }

  return mockIdeaDetail;
};

// ===== 유저 검색 (친구 아닌 사람도 포함, 검색어로만 동작) =====
export interface SearchedUser {
  id: string;
  userId: string;
  nickname: string;
  profileImageUrl?: string;
  requestStatus: 'none' | 'requested' | 'friend'; 
}

export const mockSearchedUsers: SearchedUser[] = [
  {
    id: 'user_1',
    userId: 'ddiyoung',
    nickname: '태영',
    profileImageUrl:
      'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
    requestStatus: 'requested',
  },
  {
    id: 'user_2',
    userId: 'taeyoung',
    nickname: '태영',
    profileImageUrl:
      'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
    requestStatus: 'none',
  },
  {
    id: 'user_3',
    userId: 'taeyoungyii',
    nickname: '태영',
    profileImageUrl:
      'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
    requestStatus: 'friend',
  },
];

export const searchMockUsers = async (
  searchQuery: string
): Promise<SearchedUser[]> => {
  await new Promise((r) => setTimeout(r, 300));

  return mockSearchedUsers.filter(
    (user) =>
      user.nickname.includes(searchQuery) || user.userId.includes(searchQuery)
  );
};

// ===== 친구 요청 보내기 (내가 남에게) =====
export const sendMockFriendRequest = async (
  targetUserId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
};

// ===== 친구 요청 취소 (내가 보낸 요청을 내가 취소) =====
export const cancelMockFriendRequest = async (
  targetUserId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
};

// ===== 친구 요청 수락 (남이 나에게 보낸 요청을 내가 수락, 알림에서) =====
export const acceptMockFriendRequest = async (
  requestId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
};

// ===== 친구 요청 거절 (남이 나에게 보낸 요청을 내가 거절, 알림에서) =====
export const rejectMockFriendRequest = async (
  requestId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
};