import type { RecoItem } from './recobot';
import { mockRecoSuccess } from './recobot';
import { mockRecoEmpty } from './recobot';
import { mockUser } from './user';   // 댓글/답글 작성자 정보용

// ===== 타입 =====

export interface IdeaCard {
    id : string;
    authorId: string;
    title : string;
    summary : string;
    tags? : string[];
    category : string;
    recoBotResult : RecoItem[];
    createdAt : string;
    isPublic : boolean;
    likeCount : number;
    likedByMe : boolean;
    commentCount : number;
}

export interface IdeaDetail extends IdeaCard {
    keywords : string[]; //핵심 키워드
    expectedFeatures : string[]; //예상 기능
    techStack : string[]; //추천 기술 스택
    comments : Comment[]; //댓글
}

export interface Comment {
    id : string;
    authorNickname : string;
    authorProfileImageUrl? : string;
    content : string;
    createdAt : string;
    replies : Reply[]; // 이 댓글에 달린 "답글들"의 목록
}

export interface Reply {
    id : string;
    authorNickname : string;
    authorProfileImageUrl? : string;
    content : string;
    createdAt : string;
}


// ===== 댓글/답글 mock 데이터 =====
export const mockReplies : Reply[] = [
    {
        id : 'reply1',
        authorNickname : '떠윤',
        content : '감사해요',
        createdAt : '2026.07.04',
    },
];

export const mockComments : Comment[] = [
    {
        id : 'comment1',
        authorNickname : '지원',
        content : '오 이거 좋은데?',
        createdAt : '2026.07.04',
        replies : mockReplies, //위에서 만든 답글 배열을 여기에 넣음
    },
    {
        id : 'comment2',
        authorNickname : '태영',
        content : '좋다',
        createdAt : '2026.07.04',
        replies :  [], //답글 없는 댓글
    },
];

// ===== 목록 mock 데이터 (미리보기) =====
export const mockIdeaCards : IdeaCard[] =[
    {
    id: 'idea1',
    authorId: 'friend1', // friends.ts의 Friend.id와 매칭시키기 위한 값 (친구 아이디어 필터링용)
    title: 'React Todo 앱',
    summary: '아이디어 내용 미리보기 브레인스토밍 카드 Recobot이 분석, 정리해준 핵심요약',
    tags: ['#React', '#몰라'],
    category: '생산성',
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
    title: '엣지케이스 테스트용 아주 길고 긴 아이디어 제목을 넣어서 레이아웃이 안 깨지는지 확인하는 예시',
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
];

export const mockIdeaCardsEmpty: IdeaCard[] = [];

// ===== 상세 mock 데이터 =====
export const mockIdeaDetail: IdeaDetail = {
  ...mockIdeaCards[0],
  summary:
    '이 아이디어는 할 일 관리를 위한 Todo 웹 앱입니다. 할 일 추가·삭제·완료 기능을 핵심으로 하며, 상태 관리 라이브러리를 활용한 구조적인 개발을 목표로 합니다. React 기반으로 구현할 예정이며, 생산성 향상에 도움이 되는 앱입니다.',
  keywords: ['할일관리', 'CRUD', '상태관리'],
  expectedFeatures: ['할 일 추가·삭제·완료 처리', '카테고리별 분류', '완료율 표시'],
  techStack: ['React', 'Zustand', 'localStorage'],
  comments: mockComments,
};


// ===== 목록 조회 + 필터링 가짜 서버 로직 =====
export const fetchMockIdeas = async (
    visibility? : '전체' | '공개' | '비공개',
    category? : string,
    sortBy? : 'latest' | 'oldest' | 'popular',
    searchQuery? : string
) : Promise<IdeaCard[]> => {
    await new Promise((r)=>setTimeout(r, 300));

    let result = [...mockIdeaCards];

    if(visibility === '공개'){
        result = result.filter((idea)=>idea.isPublic);
    }else if(visibility === '비공개'){
        result = result.filter((idea)=>!idea.isPublic);
    }

    if(category){
        result=result.filter((idea)=>idea.category===category);
    }

    if (searchQuery) {
        result = result.filter(
            (idea) =>
                idea.title.includes(searchQuery) ||
                idea.tags?.some((tag: string) => tag.includes(searchQuery))
        );
    }

    if(sortBy === 'latest'){
        result = result.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
    } else if(sortBy === 'oldest'){
        result = result.sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());
    }else if(sortBy === 'popular'){
        result = result.sort((a,b)=>b.likeCount-a.likeCount);
    }

    return result;
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
  request: UpdateIdeaRequest
): Promise<IdeaCard> => {
  await new Promise((r) => setTimeout(r, 500));

  const existingIdea = mockIdeaCards.find((idea) => idea.id === ideaId);
  if (!existingIdea) {
    throw { message: '존재하지 않는 아이디어예요' };
  }

  return {
    ...existingIdea,
    ...request,
  };
};

// ===== 아이디어 삭제 =====
export const deleteMockIdea = async (
  ideaId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 500));

  const exists = mockIdeaCards.some((idea) => idea.id === ideaId);
  if (!exists) {
    throw { message: '존재하지 않는 아이디어예요' };
  }

  return { success: true };
};


// ===== 댓글 작성 =====
export interface CreateCommentRequest {
  ideaId: string;
  content: string;
}

export const createMockComment = async (
  request: CreateCommentRequest
): Promise<Comment> => {
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
export const deleteMockComment = async (
  commentId: string
): Promise<{ success: boolean }> => {
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

export const createMockReply = async (
  request: CreateReplyRequest
): Promise<Reply> => {
  await new Promise((r) => setTimeout(r, 300));

  return {
    id: `reply_${Date.now()}`,
    authorNickname: mockUser.nickname,
    authorProfileImageUrl: mockUser.profileImageUrl,
    content: request.content,
    createdAt: '2026.07.04',
  };
};