import type { RecoItem } from './recobot';
import { mockRecoSuccess } from './recobot';
import { mockRecoEmpty } from './recobot';
import { mockUser } from './user'; // 댓글/답글 작성자 정보용

import { getIdeas, getIdea, updateIdea, deleteIdea, saveIdeaFromCard } from '@/api/idea';
import type { Idea as ApiIdea } from '@/api/idea';
import {
  postIdeaLike,
  deleteIdeaLike,
  getIdeaComments,
  postIdeaComment,
  deleteComment,
  postCommentReply,
} from '@/api/social';
import type { Comment as ApiComment, Reply as ApiReply } from '@/api/social';

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

// ===== 댓글/답글 mock 데이터 (friends.ts의 fetchMockFriendIdeaDetail이 아직 이 시드를 씀) =====
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
// NOTE: 아래 mockIdeaCards/mockIdeaCardsEmpty/mockIdeaDetail은 이 파일 자신의 함수들은 더 이상 안 쓰지만,
// friends.ts(fetchMockFriendsIdeas/fetchMockFriendIdeaDetail)와 mypage.ts(팀원 담당, 아직 mock 단계)가
// 그대로 참조하고 있어서 남겨둠 — 그쪽 도메인이 실 API로 전환되기 전까지 지우면 안 됨.
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

// ===== 상세 mock 데이터 (friends.ts의 fetchMockFriendIdeaDetail이 아직 이 시드를 씀) =====
export const mockIdeaDetail: IdeaDetail = {
  ...mockIdeaCards[0],
  brainstormContent:
    '할 일 추가·삭제·완료 기능이 있는 Todo 앱. 상태 관리 라이브러리도 같이 써보고 싶음.\n아아아아아',
  techStack: ['React', 'Zustand', 'localStorage'],
  comments: mockComments,
};

// ===== API 응답 ↔ 컴포넌트 타입 매퍼 =====

// API는 해시태그를 콤마 구분 단일 문자열로 내려줌(예: "#AI,#카페") — 배열로 상호 변환
const parseHashtag = (hashtag: string): string[] =>
  hashtag
    ? hashtag
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

const joinHashtag = (tags?: string[]): string => (tags ?? []).join(',');

const mapApiIdeaToCard = (idea: ApiIdea): IdeaCard => ({
  id: String(idea.ideaId),
  // TODO(2차): 응답에 작성자 정보가 없어서 임시로 내 계정으로 고정함.
  // (친구 아이디어 목록은 이 값에 의존하지 않고 별도 엔드포인트(GET /friends/{friendId}/cards)를 쓰므로 영향 없음)
  authorId: mockUser.id,
  title: idea.title,
  summary: idea.content,
  tags: parseHashtag(idea.hashtag),
  // TODO(2차): 실제 카테고리 enum 값이 확정되면 한글 라벨 매핑 테이블 추가 필요 (지금은 그대로 노출)
  category: idea.category,
  // TODO(2차): idea.recommendation 구조가 확정되면 추천 레포 매핑 필요
  recoBotResult: [],
  createdAt: formatMockDate(new Date(idea.createdAt)),
  isPublic: idea.visibility === 'PUBLIC',
  likeCount: idea.likeCount,
  // 내 담당 화면(IdeaPage/IdeaDetailPage)엔 좋아요 인터랙션이 없어서 실제로는 안 쓰임
  likedByMe: false,
  // TODO(2차): 목록 조회 응답에 댓글 수 필드가 없어서 임시로 0 — 백엔드 확인 필요
  commentCount: 0,
});

const mapApiReplyToReply = (reply: ApiReply): Reply => ({
  id: String(reply.replyId),
  authorNickname: reply.writerNickname,
  authorProfileImageUrl: reply.writerProfileImageUrl,
  content: reply.content,
  createdAt: formatMockDate(new Date(reply.createdAt)),
});

const mapApiCommentToComment = (comment: ApiComment): Comment => ({
  id: String(comment.commentId),
  authorNickname: comment.writerNickname,
  authorProfileImageUrl: comment.writerProfileImageUrl,
  content: comment.content,
  createdAt: formatMockDate(new Date(comment.createdAt)),
  replies: comment.replies.map(mapApiReplyToReply),
});

// ===== 아이디어 목록 조회 (필터/검색/정렬 조합) =====
export const fetchMockIdeas = async (
  visibility?: '전체' | '공개' | '비공개',
  category?: string,
  sortBy?: 'latest' | 'oldest' | 'popular',
  searchQuery?: string,
): Promise<IdeaCard[]> => {
  const sortByMap = { latest: 'LATEST', oldest: 'OLDEST', popular: 'POPULAR' } as const;
  const visibilityMap = { 공개: 'PUBLIC', 비공개: 'PRIVATE' } as const;

  const ideas = await getIdeas({
    category,
    keyword: searchQuery,
    sortBy: sortBy ? sortByMap[sortBy] : undefined,
    visibility: visibility && visibility !== '전체' ? visibilityMap[visibility] : undefined,
  });

  return ideas.map(mapApiIdeaToCard);
};

// ===== 아이디어 상세 조회 (id로 하나) =====
export const fetchMockIdeaDetail = async (ideaId: string): Promise<IdeaDetail> => {
  const [idea, commentsResponse] = await Promise.all([
    getIdea(Number(ideaId)),
    getIdeaComments(Number(ideaId)),
  ]);

  return {
    ...mapApiIdeaToCard(idea),
    brainstormContent: idea.content,
    // TODO(2차): idea.recommendation 구조가 확정되면 추천 기술 스택 매핑 필요
    techStack: [],
    comments: commentsResponse.comments.map(mapApiCommentToComment),
  };
};

// ===== RecoBot 추천 결과(또는 추천 없이 카드만) → 아이디어로 저장 =====
export const createMockIdeaFromRecommendation = async (
  cardId: string,
  isPublic: boolean,
  recommendationId?: number,
  repositoryId?: number,
): Promise<IdeaCard> => {
  const created = await saveIdeaFromCard(cardId, {
    visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
    recommendationId,
    repositoryId,
  });

  return mapApiIdeaToCard(created);
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
  const updated = await updateIdea(Number(ideaId), {
    title: request.title,
    hashtag: joinHashtag(request.tags),
    category: request.category,
    visibility: request.isPublic ? 'PUBLIC' : 'PRIVATE',
  });

  return mapApiIdeaToCard(updated);
};

// ===== 아이디어 삭제 =====
export const deleteMockIdea = async (ideaId: string): Promise<{ success: boolean }> => {
  await deleteIdea(Number(ideaId));
  return { success: true };
};

// ===== 좋아요 / 좋아요 취소 =====
// TODO(2차): api/social.ts에 남은 미확인 사항 그대로 적용됨 —
// 1) "다시 누르면 좋아요 취소"라는 명세 설명 때문에 POST 자체가 토글일 수도 있어서 DELETE를 계속 써야 하는지 불확실
// 2) 좋아요 취소 응답 필드가 ideaId가 아니라 cardId로 되어있음(명세 오타로 추정)
export const likeMockIdea = async (
  ideaId: string,
): Promise<{ liked: boolean; likeCount: number }> => {
  const { liked, likeCount } = await postIdeaLike(Number(ideaId));
  return { liked, likeCount };
};

export const unlikeMockIdea = async (
  ideaId: string,
): Promise<{ liked: boolean; likeCount: number }> => {
  const { liked, likeCount } = await deleteIdeaLike(Number(ideaId));
  return { liked, likeCount };
};

// ===== 댓글 작성 =====
export interface CreateCommentRequest {
  ideaId: string;
  content: string;
}

export const createMockComment = async (request: CreateCommentRequest): Promise<Comment> => {
  const created = await postIdeaComment(Number(request.ideaId), { content: request.content });

  return {
    id: String(created.commentId),
    authorNickname: mockUser.nickname,
    authorProfileImageUrl: mockUser.profileImageUrl,
    content: created.content,
    createdAt: formatMockDate(new Date(created.createdAt)),
    replies: [],
  };
};

// ===== 댓글 삭제 =====
export const deleteMockComment = async (commentId: string): Promise<{ success: boolean }> => {
  await deleteComment(Number(commentId));
  return { success: true };
};

// ===== 답글 작성 =====
export interface CreateReplyRequest {
  commentId: string;
  content: string;
}

export const createMockReply = async (request: CreateReplyRequest): Promise<Reply> => {
  const created = await postCommentReply(Number(request.commentId), { content: request.content });

  return {
    id: String(created.replyId),
    authorNickname: mockUser.nickname,
    authorProfileImageUrl: mockUser.profileImageUrl,
    content: created.content,
    createdAt: formatMockDate(new Date(created.createdAt)),
  };
};
