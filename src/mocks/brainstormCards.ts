import type { RecoItem } from './recobot';
import { fetchCardRecoItems, mockRecoSuccess } from './recobot';
import type { IdeaCard } from './ideaCards'; // 새로 추가
import { formatMockDate, joinHashtag, parseHashtag } from './ideaCards';
import { toCategoryCode, toCategoryLabel } from '@/utils/category';

import axios from 'axios';
import { deleteCard, getCard, getCards, postCard, putCard } from '@/api/brainstorm';
import type { BrainstormCard as ApiBrainstormCard } from '@/api/brainstorm';

// ===== 타입 =====
export interface BrainstormCard {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  category: string;
  createdAt: string;
  hasRecommendation?: boolean; // 미리보기 카드 status dot용. 서버 목록 응답에 추천 여부가 없어서 지금은 채워지지 않음
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
  const created = await postCard({
    title: request.title,
    content: request.content,
    category: toCategoryCode(request.category),
    hashtag: joinHashtag(request.tags),
  });

  return mapApiCardToCard(created);
};

// API 응답 → 화면에서 쓰는 카드 모양으로 변환
const mapApiCardToCard = (card: ApiBrainstormCard): BrainstormCard => ({
  id: String(card.cardId),
  title: card.title,
  content: card.content,
  tags: parseHashtag(card.hashtag),
  category: toCategoryLabel(card.category),
  createdAt: formatMockDate(new Date(card.createdAt)),
});

//카드 하나 조회하는 함수
export const fetchMockCardDetail = async (
  cardId : string
  ): Promise<BrainstormCardDetail> => {
  try {
    const [card, recoBotResult] = await Promise.all([
      getCard(Number(cardId)),
      fetchCardRecoItems(cardId),
    ]);

    return {
      ...mapApiCardToCard(card),
      recoBotResult, // 보관된 추천 결과가 있으면 그걸, 없으면 아직 추천 안 받은 상태이므로 null
    };
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    // 없는 카드(404)나 잘못된 id(400)면 "존재하지 않는 카드"로, 그 외(네트워크/서버 오류)는 일반 실패로 안내
    throw {
      message: status === 400 || status === 404 ? '존재하지 않는 카드예요' : '카드를 불러오지 못했어요',
    };
  }
};

// ===== 목록 조회 (카테고리/정렬/검색 조합) =====
export const fetchMockCards = async (
  category?: string,
  sortBy?: 'latest' | 'oldest',
  searchQuery?: string,
): Promise<BrainstormCard[]> => {
  const sortByMap = { latest: 'LATEST', oldest: 'OLDEST' } as const;

  const cards = await getCards({
    category: category ? toCategoryCode(category) : undefined,
    keyword: searchQuery?.trim().replace(/^#/, '') || undefined,
    sortBy: sortBy ? sortByMap[sortBy] : undefined,
  });

  return cards.map(mapApiCardToCard);
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
  const updated = await putCard(Number(cardId), {
    title: request.title,
    content: request.content,
    category: toCategoryCode(request.category),
    hashtag: joinHashtag(request.tags),
  });

  return mapApiCardToCard(updated);
};

// ===== 카드 삭제 =====
export const deleteMockBrainstormCard = async (
  cardId: string,
): Promise<{ success: boolean }> => {
  await deleteCard(Number(cardId));

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
