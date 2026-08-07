import type { RecoItem } from './recobot';
import { mockRecoSuccess } from './recobot';
import type { IdeaCard } from './ideaCards'; // 새로 추가

// ===== 타입 =====
export interface BrainstormCard {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  category: string;
  createdAt: string;
  hasRecommendation?: boolean; // 목록 조회 시 계산되는 파생 필드 (미리보기 카드 status dot 단계 표시용)
}

export interface BrainstormCardDetail extends BrainstormCard {
  recoBotResult: RecoItem[] | null; // 레코봇 추천 결과까지 필요하므로
} // 추천 받은 경우 배열로 있고 아닌 경우 없음

// ===== 목록 mock 데이터 (미리보기) =====
export const mockBrainstormCards: BrainstormCard[] = [
  {
    id: 'card1',
    title: 'React Todo 앱',
    content: '할 일 추가·삭제·완료 기능이 있는 Todo 앱. 상태 관리 라이브러리도 같이 써보고 싶음.',
    tags: ['#React', '#몰라'],
    category: '업무/도구',
    createdAt: '2026.06.24',
  },
  {
    id: 'card2',
    title: '스터디 매칭 서비스',
    content: '근처에서 같은 과목 공부하는 사람 찾기',
    tags: ['#학습'],
    category: '사람',
    createdAt: '2026.06.20',
  },
  {
    id: 'card3',
    title:
      '엣지케이스 테스트용 아주 길고 긴 카드 제목을 넣어서 레이아웃이 안 깨지는지 확인하는 예시',
    content: '내용도 길게 써서 잘림 처리가 잘 되는지 확인하는 용도로 만든 테스트 데이터입니다.',
    tags: ['#테스트', '#헬스', '#기타'],
    category: '기타',
    createdAt: '2026.06.01',
  },
];

// ===== 카드 생성 (카드 기록) =====
export interface CreateBrainstormCardRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export const createMockBrainstormCard = async (
  request: CreateBrainstormCardRequest,
): Promise<BrainstormCard> => {
  await new Promise((r) => setTimeout(r, 500));

  const newCard : BrainstormCard = {
    id: `card_${Date.now()}`,
    title: request.title,
    content: request.content,
    tags: request.tags,
    category: request.category,
    createdAt: '2026.07.04',
  };

  mockBrainstormCards.push(newCard);
  // 실제 서버라면 DB에 저장되는 부분. mock이라 그냥 배열에 추가해서
  // 이후 fetchMockCards / 상세 조회에서도 이 카드가 조회되게 함

  return newCard;
};

// ===== 카드별로 "보관"하기로 확정한 RecoBot 추천 결과 =====
// 카드 하나에 여러 개 쌓일 수 있음 (추천받기 → 보관 → 추천받기 → 보관 ...)
const cardRecoResults: Record<string, RecoItem[]> = {};

export const appendMockRecoResult = async (
  cardId: string,
  item: RecoItem,
): Promise<RecoItem[]> => {
  await new Promise((r) => setTimeout(r, 300));

  const existing = cardRecoResults[cardId] ?? [];
  const updated = [item, ...existing]; // 가장 최근에 보관한 게 목록 맨 위로
  cardRecoResults[cardId] = updated;

  return updated;
};

//카드 하나 조회하는 함수
export const fetchMockCardDetail = async (
  cardId : string
  ): Promise<BrainstormCardDetail> => {
  await new Promise((r) => setTimeout(r, 300));

  const card = mockBrainstormCards.find((c) => c.id === cardId);
  if(!card){
    throw {message : '존재하지 않는 카드예요'};
  }

  return {
    ...card,
    recoBotResult : cardRecoResults[cardId] ?? null,
    // 보관된 추천 결과가 있으면 그걸, 없으면 아직 추천 안 받은 상태이므로 null
  };
};

// ===== 목록 조회 + 필터링 가짜 서버 로직 =====
export const fetchMockCards = async (
  category?: string,
  sortBy?: 'latest' | 'oldest',
  searchQuery?: string,
): Promise<BrainstormCard[]> => {
  await new Promise((r) => setTimeout(r, 300));

  let result = [...mockBrainstormCards];

  if (category) {
    result = result.filter((card) => card.category === category);
  }

  if (searchQuery) {
    result = result.filter(
      (idea) =>
        idea.title.includes(searchQuery) || idea.tags?.some((tag) => tag.includes(searchQuery)),
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
  }

  // 카드마다 보관된 추천 결과가 있는지 계산해서 붙임 (미리보기 카드 status dot 단계 표시용)
  return result.map((card) => ({
    ...card,
    hasRecommendation: (cardRecoResults[card.id]?.length ?? 0) > 0,
  }));
};

// ===== 상세 mock 데이터 (추천 받은 경우 / 안 받은 경우) =====
export const mockCardDetailwithReco: BrainstormCardDetail = {
  ...mockBrainstormCards[0], // ← 이건 "카드" 배열에서 인덱스
  recoBotResult: mockRecoSuccess, // ← 이건 "추천 레포" 배열 전체
};

export const mockCardDetailwithoutReco: BrainstormCardDetail = {
  ...mockBrainstormCards[0],
  recoBotResult: null,
};

// ===== 카드 수정 =====
export interface UpdateBrainstormCardRequest {
  title: string;
  content: string;
  tags?: string[];
  category: string;
}

export const UpdateMockBrainstormCard = async (
  cardId: string,
  request: UpdateBrainstormCardRequest,
): Promise<BrainstormCard> => {
  await new Promise((r) => setTimeout(r, 500));

  const index = mockBrainstormCards.findIndex((c) => c.id === cardId);
  if(index === -1){
    throw {message: '존재하지 않는 카드예요'};
  }

  const updatedCard : BrainstormCard = {
    ...mockBrainstormCards[index], // 기존 카드 필드 다 펼침
    ...request, //그 위에 새로 입력한 값으로 덮어씀
  }

  mockBrainstormCards[index] = updatedCard;
  //배열의 해당 인덱스를 새 객체로 실제로 교체함

  return updatedCard;
};

// ===== 카드 삭제 =====
export const deleteMockBrainstormCard = async (
  cardId: string, // → 삭제하고 싶은 카드의 id 하나만 받음
): Promise<{ success: boolean }> => {
  //삭제했는지 성공 여부만 돌려줌
  await new Promise((r) => setTimeout(r, 500));

  //배열을 하나씩 보면서 이 카드의 id가 지우려는 cardId랑 같은 게 있는지 체크
  const index = mockBrainstormCards.findIndex((c) => c.id === cardId);
  if (index === -1) {
    throw { message: '존재하지 않는 카드예요' };
  }
  mockBrainstormCards.splice(index, 1)
  //findIndex로 지울 카드의 배열 위치를 찾고, splice로 그위치에서 실제로 1개를 제거함.

  return { success: true };
};

// ===== 브레인스토밍 카드 → 아이디어로 저장 =====
export interface ConvertToIdeaRequest {
  cardId: string;
  isPublic: boolean;
}

export const ConvertMockCardToIdea = async (request: ConvertToIdeaRequest): Promise<IdeaCard> => {
  await new Promise((r) => setTimeout(r, 500));

  const card = mockBrainstormCards.find((c) => c.id === request.cardId);
  if (!card) {
    throw { message: '존재하지 않는 카드예요' };
  }

  return {
    id: `idea_${Date.now()}`, // 카드 id 말고 새 아이디어 id
    title: card.title,
    summary:
      '이 아이디어는 할 일 관리를 위한 Todo 웹 앱입니다. 할 일 추가·삭제·완료 기능을 핵심으로 하며...', // AI가 새로 생성한 요약 (mock이니 고정 텍스트)
    tags: card.tags,
    category: card.category,
    createdAt: '2026.07.04', // 아이디어 생성 시각
    authorId: 'mock-user',
    isPublic: request.isPublic,
    likeCount: 0,
    likedByMe: false,
    commentCount: 0,
    recoBotResult: mockRecoSuccess,
  };
};
