import type { RecoItem } from './recobot';
import { mockRecoSuccess } from './recobot';
import { mockRecoEmpty } from './recobot';
import { mockUser } from './user'; // 댓글/답글 작성자 정보용

// 다른 시드 데이터('2026.06.24' 등)와 형식을 맞추기 위한 헬퍼
const formatMockDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

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
    authorId: mockUser.id, // 내가 쓴 아이디어(마이페이지 통계/아이디어 페이지 테스트용)
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
    authorId: mockUser.id,
    title: '스터디 매칭 서비스',
    summary: '근처에서 같은 과목 공부하는 사람 찾기 프로젝트를 위한 AI 분석 요약',
    tags: ['#학습'],
    category: '사람',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.06.20',
    isPublic: false,
    likeCount: 0,
    likedByMe: false,
    commentCount: 0,
  },
  {
    id: 'idea_3',
    authorId: mockUser.id,
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
    authorId: mockUser.id,
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
    authorId: mockUser.id,
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
    authorId: mockUser.id,
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

  // ===== 친구들이 작성한 아이디어 (Friends 페이지의 fetchMockFriendsIdeas용) =====
  {
    id: 'idea7',
    authorId: 'friend1',
    title: '중고 거래 안전결제 챗봇',
    summary: '중고 거래 채팅방에 안전결제를 자동으로 안내해주는 챗봇 아이디어 요약',
    tags: ['#중고거래', '#챗봇'],
    category: '업무/도구',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.05.28',
    isPublic: true,
    likeCount: 15,
    likedByMe: false,
    commentCount: 1,
  },
  {
    id: 'idea8',
    authorId: 'friend1',
    title: '기숙사 세탁기 예약 앱',
    summary: '기숙사 공용 세탁기 사용 현황을 실시간으로 보여주고 예약할 수 있는 앱 요약',
    tags: ['#기숙사', '#예약'],
    category: '생활',
    recoBotResult: mockRecoEmpty,
    createdAt: '2026.05.20',
    isPublic: true,
    likeCount: 8,
    likedByMe: false,
    commentCount: 0,
  },
  {
    id: 'idea9',
    authorId: 'friend2',
    title: '팀플 역할 분담 자동 배정기',
    summary: '팀플 인원 성향을 입력하면 역할을 자동으로 배정해주는 서비스 요약',
    tags: ['#팀플', '#자동화'],
    category: '업무/도구',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.05.15',
    isPublic: true,
    likeCount: 42,
    likedByMe: true,
    commentCount: 6,
  },
  {
    id: 'idea10',
    authorId: 'friend2',
    title: '식물 성장 기록 다이어리',
    summary: '반려식물 사진을 매일 기록해서 성장 타임랩스를 만들어주는 앱 요약',
    tags: ['#식물', '#기록'],
    category: '생활',
    recoBotResult: mockRecoEmpty,
    createdAt: '2026.05.10',
    isPublic: false,
    likeCount: 3,
    likedByMe: false,
    commentCount: 0,
  },
  {
    id: 'idea11',
    authorId: 'friend3',
    title: '캠퍼스 분실물 매칭 서비스',
    summary: '캠퍼스 내 분실물을 사진으로 등록하면 주인을 찾아주는 서비스 요약',
    tags: ['#분실물', '#캠퍼스'],
    category: '생활',
    recoBotResult: mockRecoSuccess,
    createdAt: '2026.05.08',
    isPublic: true,
    likeCount: 27,
    likedByMe: false,
    commentCount: 4,
  },
  {
    id: 'idea12',
    authorId: 'friend3',
    title: '스터디 카페 자리 실시간 안내',
    summary: '스터디 카페 좌석 현황을 실시간으로 보여주는 서비스에 대한 아이디어 요약',
    tags: ['#스터디카페', '#실시간'],
    category: '업무/도구',
    recoBotResult: mockRecoEmpty,
    createdAt: '2026.05.02',
    isPublic: true,
    likeCount: 11,
    likedByMe: true,
    commentCount: 2,
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

  // /ideas 페이지는 "내 아이디어" 목록임 — 친구들 아이디어는 Friends 페이지(fetchMockFriendsIdeas)에서 따로 봄
  let result = mockIdeaCards.filter((idea) => idea.authorId === mockUser.id);

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
    createdAt: formatMockDate(new Date()),
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

  // 댓글 목록은 컴포넌트가 로컬 state로 들고 있고(새로 작성한 댓글도 여기 포함) 이 mockComments 배열엔 안 들어가므로,
  // 여기서 존재 여부를 mockComments 기준으로 검사하면 새로 쓴 댓글은 전부 삭제 실패로 처리되는 버그가 있었음
  void commentId;
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
