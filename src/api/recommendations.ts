import { apiClient } from './client';

// ===== AI 추천 요청 및 재요청 =====
export interface RequestRecommendationBody {
  cardId: number;
  // 재요청 시 이미 추천받은 레포를 다시 안 주기 위해 제외할 레포 id 목록
  excludedRepositoryIds: number[];
}

export interface RecommendedRepo {
  repositoryId: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  techStack: string[];
  stars: number;
  forks: number;
  updatedAt: string;
  reason: string;
}

export const postRecommendationRequest = async (
  request: RequestRecommendationBody,
): Promise<RecommendedRepo[]> => {
  const { data } = await apiClient.post<RecommendedRepo[]>(
    '/api/recommendations/request',
    request,
  );
  return data;
};

// ===== AI 추천 목록 조회 =====
export const getRecommendations = async (cardId: number): Promise<RecommendedRepo[]> => {
  const { data } = await apiClient.get<RecommendedRepo[]>(`/api/recommendations/cards/${cardId}`);
  return data;
};

// ===== AI 추천 결과 정렬 =====
// 명세 URL이 "/recommendations?sortBy=..."로만 적혀있지만 필요정보에 cardId path variable도
// 있다고 되어있어서, 위 "AI 추천 목록 조회"와 같은 경로에 sortBy 쿼리만 추가된 것으로 보고 작성함
// — 실제 경로 확인 필요.
// 응답도 목록조회(RecommendedRepo)와 달리 recommendationId/status/createdAt이 포함되고
// techStack이 배열이 아니라 문자열로 내려옴(스펙 불일치로 보임). "AI 추천 취소"에 필요한
// recommendationId가 이 응답에만 있어서, 취소하려면 이 엔드포인트로 먼저 id를 얻어야 할 수 있음
export interface SortedRecommendation {
  recommendationId: number;
  cardId: number;
  repositoryId: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  techStack: string;
  stars: number;
  forks: number;
  updatedAt: string;
  reason: string;
  status: string;
  createdAt: string;
}

export const getSortedRecommendations = async (
  cardId: number,
  sortBy: 'LATEST' | 'STAR' | 'FORK',
): Promise<SortedRecommendation[]> => {
  const { data } = await apiClient.get<SortedRecommendation[]>(
    `/api/recommendations/cards/${cardId}`,
    { params: { sortBy } },
  );
  return data;
};

// ===== AI 추천 취소 =====
export interface CancelRecommendationResponse {
  recommendationId: number;
  status: string;
  message: string;
}

export const patchCancelRecommendation = async (
  recommendationId: number,
  // true: 이력 보관, false: 완전 삭제
  saveHistory: boolean,
): Promise<CancelRecommendationResponse> => {
  const { data } = await apiClient.patch<CancelRecommendationResponse>(
    `/api/recommendations/${recommendationId}/cancel`,
    undefined,
    { params: { saveHistory } },
  );
  return data;
};
