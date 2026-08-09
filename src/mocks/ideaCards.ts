import type { RecoItem } from './recobot';
import { mockRecoSuccess } from './recobot';
import { mockRecoEmpty } from './recobot';
import { mockUser } from './user'; // 댓글/답글 작성자 정보용

// ===== 타입 =====

export interface IdeaCard {
  id: string;
  authorId: string;
  title: string;
  summary: string;
  tags?: string[];
  category: string;
  recoBotResult: RecoItem[];
  createdAt: string;
  isPublic: boolean;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
}

export interface IdeaDetail extends IdeaCard {
  brainstormContent: string; //브레인스토밍 작성내용 그대로
  techStack: string[]; //추천 기술 스택
  comments: Comment[]; //댓글
}

export interface Comment {
  id: string;
  authorNickname: string;
  authorProfileImageUrl?: string;
  content: string;
  createdAt: string;
  replies: Reply[]; // 이 댓글에 달린 "답글들"의 목록
}

export interface Reply {
  id: string;
  authorNickname: string;
  authorProfileImageUrl?: string;
  content: string;
  createdAt: string;
}

// ===== 댓글/답글 mock 데이터 =====
export const mockReplies: Reply[] = [
  {
    id: 'reply1',
    authorNickname: '떠윤',
    content: '감사해요',
    createdAt: '2026.07.04',
  },
];

export const mockComments: Comment[] = [
  {
    id: 'comment1',
    authorNickname: '지원',
    content: '오 이거 좋은데?',
    createdAt: '2026.07.04',
    replies: mockReplies, //위에서 만든 답글 배열을 여기에 넣음
  },
  {
    id: 'comment2',
    authorNickname: '태영',
    content: '좋다',
    createdAt: '2026.07.04',
    replies: [], //답글 없는 댓글
  },
];

// ===== 목록 mock 데이터 (미리보기) =====
export const mockIdeaCards: IdeaCard[] = [
  {
    id: 'idea1',
    authorId: 'friend1', // friends.ts의 Friend.id와 매칭시키기 위한 값 (친구 아이디어 필터링용)
    title: 'React Todo 앱',
    summary: '아이디어 내용 미리보기 브레인스토밍 카드 Recobot이 분석, 정리해준 핵심요약',
    tags: ['#React', '#몰라'],
    category: '업무/도구',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.06.24',
    isPublic: true,
    likeCount: 12,
    likedByMe: false,
    commentCount: 2,
  },
  {
    id: 'idea2',
    authorId: 'friend2',
    title: '스터디 매칭 서비스',
    summary: '근처에서 같은 과목 공부하는 사람 찾기 프로젝트를 위한 AI 분석 요약',
    tags: ['#학습'],
    category: '교육',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.06.20',
    isPublic: false,
    likeCount: 0,
    likedByMe: false,
    commentCount: 0,
  },
  {
    id: 'idea_3',
    authorId: 'friend3',
    title:
      '엣지케이스 테스트용 아주 길고 긴 아이디어 제목을 넣어서 레이아웃이 안 깨지는지 확인하는 예시',
    summary: '내용도 길게 써서 잘림 처리가 잘 되는지 확인하는 용도로 만든 테스트 데이터입니다.',
    tags: ['#테스트', '#헬스', '#기타'],
    category: '기타',
    recoBotResult: mockRecoEmpty,
    createdAt: '2026.06.01',
    isPublic: true,
    likeCount: 9999,
    likedByMe: true,
    commentCount: 87,
  },
  {
    id: 'idea4',
    authorId: 'friend1',
    title: '반려식물 물주기 알림 앱',
    summary: '반려식물마다 물 주기 주기를 설정하고 알림을 받는 앱에 대한 아이디어 요약',
    tags: ['#반려식물', '#알림'],
    category: '생활',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.06.18',
    isPublic: true,
    likeCount: 34,
    likedByMe: true,
    commentCount: 5,
  },
  {
    id: 'idea5',
    authorId: 'friend2',
    title: '동네 맛집 랜덤 추천 서비스로 매번 뭐 먹을지 고민하는 시간을 줄여주는 아이디어',
    summary: '오늘 뭐 먹을지 고민하는 시간을 줄여주는 랜덤 맛집 추천 서비스 요약',
    tags: ['#맛집', '#추천'],
    category: '생활',
    recoBotResult: mockRecoEmpty,
    createdAt: '2026.06.10',
    isPublic: true,
    likeCount: 7,
    likedByMe: true,
    commentCount: 1,
  },
  {
    id: 'idea6',
    authorId: 'friend3',
    title: '운동 루틴 공유 커뮤니티',
    summary: '나만의 운동 루틴을 기록하고 다른 사람들과 공유하는 커뮤니티 서비스 요약',
    tags: ['#운동', '#커뮤니티'],
    category: '건강',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.06.05',
    isPublic: true,
    likeCount: 21,
    likedByMe: true,
    commentCount: 3,
  },
];

export const mockIdeaCardsEmpty: IdeaCard[] = [];

// ===== 상세 mock 데이터 =====
export const mockIdeaDetail: IdeaDetail = {
  ...mockIdeaCards[0],
  brainstormContent:
    '할 일 추가·삭제·완료 기능이 있는 Todo 앱. 상태 관리 라이브러리도 같이 써보고 싶음.\n아아아아아',
  techStack: ['React', 'Zustand', 'localStorage'],
  comments: mockComments,
};

// ===== 아이디어 상세 조회 (id로 하나) =====
export const fetchMockIdeaDetail = async (ideaId: string): Promise<IdeaDetail> => {
  await new Promise((r) => setTimeout(r, 300));

  // idea1(mockIdeaDetail)은 brainstormContent/techStack/comments가 채워진 상세 mock이라 그대로 반환
  if (ideaId === mockIdeaDetail.id) {
    return mockIdeaDetail;
  }

  const idea = mockIdeaCards.find((i) => i.id === ideaId);
  if (!idea) {
    throw { message: '존재하지 않는 아이디어예요' };
  }

  // 그 외 아이디어는 아직 상세 mock이 준비 안 되어 있어서 빈 값으로 반환
  return {
    ...idea,
    brainstormContent: '',
    techStack: [],
    comments: [],
  };
};

// ===== 목록 조회 + 필터링 가짜 서버 로직 =====
export const fetchMockIdeas = async (
  visibility?: '전체' | '공개' | '비공개',
  category?: string,
  sortBy?: 'latest' | 'oldest' | 'popular',
  searchQuery?: string,
): Promise<IdeaCard[]> => {
  await new Promise((r) => setTimeout(r, 300));

  let result = [...mockIdeaCards];

  if (visibility === '공개') {
    result = result.filter((idea) => idea.isPublic);
  } else if (visibility === '비공개') {
    result = result.filter((idea) => !idea.isPublic);
  }

  if (category) {
    result = result.filter((idea) => idea.category === category);
  }

  if (searchQuery) {
    result = result.filter(
      (idea) =>
        idea.title.includes(searchQuery) ||
        idea.tags?.some((tag: string) => tag.includes(searchQuery)),
    );
  }

  if (sortBy === 'latest') {
    result = result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (sortBy === 'oldest') {
    result = result.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else if (sortBy === 'popular') {
    result = result.sort((a, b) => b.likeCount - a.likeCount);
  }

  return result;
};

// ===== RecoBot 추천 결과 → 아이디어로 저장 =====
export interface CreateIdeaFromRecommendationRequest {
  cardTitle: string;
  cardContent: string;
  category: string;
  tags?: string[];
  recoItem?: RecoItem;
  isPublic: boolean;
}

export const createMockIdeaFromRecommendation = async (
  request: CreateIdeaFromRecommendationRequest,
): Promise<IdeaCard> => {
  await new Promise((r) => setTimeout(r, 500));

  const newIdea: IdeaCard = {
    id: `idea_${Date.now()}`,
    authorId: mockUser.id,
    title: request.cardTitle,
    summary: request.cardContent,
    tags: request.tags,
    category: request.category,
    recoBotResult: request.recoItem ? [request.recoItem] : [],
    createdAt: new Date().toISOString(),
    isPublic: request.isPublic,
    likeCount: 0,
    likedByMe: false,
    commentCount: 0,
  };

  mockIdeaCards.push(newIdea);
  return newIdea;
};

// ===== 아이디어 수정 =====
export interface UpdateIdeaRequest {
  title: string;
  tags?: string[];
  category: string;
  isPublic: boolean;
}

export const updateMockIdea = async (
  ideaId: string,
  request: UpdateIdeaRequest,
): Promise<IdeaCard> => {
  await new Promise((r) => setTimeout(r, 500));

  const index = mockIdeaCards.findIndex((idea) => idea.id === ideaId);
  if (index === -1) {
    throw { message: '존재하지 않는 아이디어예요' };
  }

  const updatedIdea = { ...mockIdeaCards[index], ...request };
  mockIdeaCards[index] = updatedIdea;

  // 상세 mock(mockIdeaDetail)도 같은 아이디어면 같이 갱신해서 상세 페이지로 돌아갔을 때 반영되게 함
  if (mockIdeaDetail.id === ideaId) {
    Object.assign(mockIdeaDetail, request);
  }

  return updatedIdea;
};

// ===== 아이디어 삭제 =====
export const deleteMockIdea = async (ideaId: string): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 500));

  const index = mockIdeaCards.findIndex((idea) => idea.id === ideaId);
  if (index === -1) {
    throw { message: '존재하지 않는 아이디어예요' };
  }

  mockIdeaCards.splice(index, 1);
  return { success: true };
};

// ===== 댓글 작성 =====
export interface CreateCommentRequest {
  ideaId: string;
  content: string;
}

export const createMockComment = async (request: CreateCommentRequest): Promise<Comment> => {
  await new Promise((r) => setTimeout(r, 300));

  return {
    id: `comment_${Date.now()}`,
    authorNickname: mockUser.nickname,
    authorProfileImageUrl: mockUser.profileImageUrl,
    content: request.content,
    createdAt: '2026.07.04',
    replies: [],
  };
};

// ===== 댓글 삭제 =====
export const deleteMockComment = async (commentId: string): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 300));

  const exists = mockComments.some((comment) => comment.id === commentId);
  if (!exists) {
    throw { message: '존재하지 않는 댓글이에요' };
  }

  return { success: true };
};

// ===== 답글 작성 =====
export interface CreateReplyRequest {
  commentId: string;
  content: string;
}

export const createMockReply = async (request: CreateReplyRequest): Promise<Reply> => {
  await new Promise((r) => setTimeout(r, 300));

  return {
    id: `reply_${Date.now()}`,
    authorNickname: mockUser.nickname,
    authorProfileImageUrl: mockUser.profileImageUrl,
    content: request.content,
    createdAt: '2026.07.04',
  };
};
