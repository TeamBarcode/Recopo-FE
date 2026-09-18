import { apiClient } from './client';

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

// 추천받기 시작 ~ 취소/아이디어로 저장까지 한 "사이클"을 recommendationId로 묶고,
// 그 사이클 안에서 추천된 레포들이 repositories 배열로 쌓임
// (다시 추천받기 = 새 recommendation이 아니라 같은 recommendation에 레포가 추가되는 것)
export interface Recommendation {
  recommendationId: number;
  cardId: number;
  status?: string;
  createdAt?: string;
  repositories: RecommendedRepo[];
}

// ===== AI 추천 요청 및 재요청 =====
export interface RequestRecommendationBody {
  cardId: number;
  // 재요청 시 이미 추천받은 레포를 다시 안 주기 위해 제외할 레포 id 목록
  excludedRepositoryIds: number[];
}

export const postRecommendationRequest = async (
  request: RequestRecommendationBody,
): Promise<Recommendation> => {
  const { data } = await apiClient.post<Recommendation>('/api/recommendations/request', request);
  return data;
};

// ===== AI 추천 목록 조회 =====
// 카드 하나당 현재 유효한 recommendation은 최대 1개라 배열이 아니라 단일 객체로 내려옴
export const getRecommendation = async (cardId: number): Promise<Recommendation> => {
  const { data } = await apiClient.get<Recommendation>(`/api/recommendations/cards/${cardId}`);
  return data;
};

// ===== AI 추천 결과 정렬 =====
// "선택한 카드"가 아니라 지금 챗봇 세션에서 진행 중인 recommendation의 레포들을 정렬하는 것.
// 추천 요청(postRecommendationRequest)이 recommendationId 없이도 "지금 진행 중인 사이클"을
// 서버가 알아서 추적하는 것과 같은 방식이라, cardId 없이 sortBy만 받는 게 맞음
export const getSortedRecommendations = async (
  sortBy: 'LATEST' | 'STAR' | 'FORK',
): Promise<Recommendation[]> => {
  const { data } = await apiClient.get<Recommendation[]>('/api/recommendations', {
    params: { sortBy },
  });
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
