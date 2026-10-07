import { apiClient } from './client';

export interface BrainstormCard {
  cardId: number;
  memberId: number;
  title: string;
  content: string;
  hashtag: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ===== 카드 생성 =====
export interface CreateCardRequest {
  title: string;
  content: string;
  category: string;
  hashtag: string;
}

export const postCard = async (request: CreateCardRequest): Promise<BrainstormCard> => {
  const { data } = await apiClient.post<BrainstormCard>('/api/cards', request);
  return data;
};

// ===== 카드 목록 조회 =====
// 명세상 "목록 조회 / 카테고리별 조회 / 검색 / 정렬"이 전부 같은 GET /cards 엔드포인트의
// 쿼리 파라미터 조합일 뿐이라 함수 하나로 합침 (파라미터를 조합해서 같이 써도 됨)
export interface GetCardsParams {
  category?: string;
  keyword?: string;
  sortBy?: 'LATEST' | 'OLDEST' | 'MODIFIED';
}

export const getCards = async (params?: GetCardsParams): Promise<BrainstormCard[]> => {
  const { data } = await apiClient.get<BrainstormCard[]>('/api/cards', { params });
  return data;
};

// ===== 카드 상세 조회 =====
export const getCard = async (cardId: number): Promise<BrainstormCard> => {
  const { data } = await apiClient.get<BrainstormCard>(`/api/cards/${cardId}`);
  return data;
};

// ===== 카드 수정 =====
export interface UpdateCardRequest {
  title: string;
  content: string;
  category: string;
  hashtag: string;
}

export const putCard = async (
  cardId: number,
  request: UpdateCardRequest,
): Promise<BrainstormCard> => {
  const { data } = await apiClient.put<BrainstormCard>(`/api/cards/${cardId}`, request);
  return data;
};

// ===== 카드 삭제 =====
// 성공 시 204 No Content라 응답 바디가 없음
export const deleteCard = async (cardId: number): Promise<void> => {
  await apiClient.delete(`/api/cards/${cardId}`);
};
