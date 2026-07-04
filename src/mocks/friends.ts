import type { IdeaCard, IdeaDetail,  } from './ideaCards';
import { mockIdeaCards, mockIdeaDetail } from './ideaCards';

// ===== 타입 =====
export interface Friend {
    id : string;
    userId: string;
    nickname : string;
    profileImageUrl? : string;
}

// ===== 목록 mock 데이터 =====
export const mockFriendsSuccess: Friend[] = [
    {
    id: 'friend1',
    userId: 'himdleda',
    nickname: 'himdleda',
    profileImageUrl: 'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
    },
    {
        id: 'friend2',
        userId: 'appeach',
        nickname: '어피치',
        profileImageUrl: 'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
    },
    {
        id: 'friend3',
        userId: 'jccredred',
        nickname: 'jccredred',
        profileImageUrl: 'https://i.pinimg.com/originals/26/ab/52/26ab52b000cf94c3c2941e7812ef61e2.gif',
    },
];

export const mockFriendsEmpty: Friend[] = [];

// ===== 검색 필터링 가짜 서버 로직 =====
export const fetchMockFriends = async (
  searchQuery?: string
): Promise<Friend[]> => {
  await new Promise((r) => setTimeout(r, 300));

  if (!searchQuery) return mockFriendsSuccess;

  return mockFriendsSuccess.filter(
    (friend) =>
      friend.nickname.includes(searchQuery) ||
      friend.userId.includes(searchQuery)
  );
};


// ===== 친구의 아이디어 목록 조회 (공개된 것만) =====
export const fetchMockFriendsIdeas = async (
    friendId : string, // Friend.id 값 (userId 아님) — ideaCards.ts의 authorId와 이 값으로 매칭됨
    category? : string,
    sortBy? : 'latest' | 'oldest',
): Promise<IdeaCard[]> => {
    await new Promise((r)=>setTimeout(r, 300));

    let result = mockIdeaCards.filter(
        (idea) => idea.isPublic && idea.authorId === friendId
    );

    if (category) {
        result = result.filter((idea) => idea.category === category);
        // ↑ 카테고리 선택했으면 그것도 추가로 걸러냄
    }

    if (sortBy === 'latest') { 
        result = result.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest'){
        result = result.sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());
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