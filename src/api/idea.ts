import { apiClient } from './client';

export interface Idea {
  ideaId: number;
  title: string;
  content: string;
  // 명세 예시엔 콤마 구분 단일 문자열로 내려옴(예: "#AI,#카페")
  hashtag: string;
  category: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  likeCount: number;
  createdAt: string;
  // 명세 예시엔 null만 있어서 실제 값이 있을 때의 구조는 확인 필요
  recommendation: unknown;
}

// ===== 아이디어 목록/카테고리별/검색/정렬/공개여부 필터 조회 =====
// 명세상 전부 같은 GET /ideas의 쿼리 파라미터 조합이라 함수 하나로 합침
export interface GetIdeasParams {
  category?: string;
  keyword?: string;
  sortBy?: 'LATEST' | 'OLDEST' | 'POPULAR';
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export const getIdeas = async (params?: GetIdeasParams): Promise<Idea[]> => {
  const { data } = await apiClient.get<Idea[]>('/api/ideas', { params });
  return data;
};

// ===== 아이디어 상세 조회 =====
export const getIdea = async (ideaId: number): Promise<Idea> => {
  const { data } = await apiClient.get<Idea>(`/api/ideas/${ideaId}`);
  return data;
};

// ===== 아이디어 수정 =====
export interface UpdateIdeaRequest {
  title: string;
  hashtag: string;
  category: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

export const updateIdea = async (ideaId: number, request: UpdateIdeaRequest): Promise<Idea> => {
  const { data } = await apiClient.put<Idea>(`/api/ideas/${ideaId}`, request);
  return data;
};

// ===== 아이디어 삭제 =====
// 성공 시 204 No Content라 응답 바디가 없음
export const deleteIdea = async (ideaId: number): Promise<void> => {
  await apiClient.delete(`/api/ideas/${ideaId}`);
};

// ===== 브레인스토밍 카드를 아이디어로 저장(전환) =====
// recommendationId/repositoryId는 선택값 — AI 추천을 거치지 않고 카드를 바로 저장하는 경로도 있음
export interface SaveIdeaFromCardRequest {
  visibility: 'PUBLIC' | 'PRIVATE';
  recommendationId?: number;
  repositoryId?: number;
}

// 응답 본문 예시가 명세서에 없어(200 OK만 명시) 아이디어 객체를 반환한다고 가정 — 실제 응답이 다르면 조정 필요
export const saveIdeaFromCard = async (
  cardId: string,
  request: SaveIdeaFromCardRequest,
): Promise<Idea> => {
  const { data } = await apiClient.post<Idea>(`/api/ideas/cards/${cardId}/ideas`, request);
  return data;
};
