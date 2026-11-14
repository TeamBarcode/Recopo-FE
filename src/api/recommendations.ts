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

// 실제 서버(백엔드 Recommendation 엔티티)는 추천 "레포 한 개 = 한 줄"인 평평한 목록으로 내려줌
// (recommendationId가 레포마다 다름). 명세의 { recommendationId, repositories: [...] } 모양과 둘 다 읽도록 맞춤
interface RecommendationRow {
  recommendationId: number;
  cardId: number;
  status?: string;
  createdAt?: string;
  repositoryId: number;
  repositoryName: string;
  repositoryFullName: string;
  repositoryUrl: string;
  repositoryDescription: string;
  language: string;
  techStack: string | null;
  starCount: number;
  forkCount: number;
  updatedAt: string;
  reason: string;
}

const toRecommendation = (raw: Recommendation | RecommendationRow): Recommendation => {
  if ('repositories' in raw) return raw;

  return {
    recommendationId: raw.recommendationId,
    cardId: raw.cardId,
    status: raw.status,
    createdAt: raw.createdAt,
    repositories: [
      {
        repositoryId: raw.repositoryId,
        name: raw.repositoryName,
        fullName: raw.repositoryFullName,
        url: raw.repositoryUrl,
        description: raw.repositoryDescription,
        language: raw.language,
        techStack: raw.techStack
          ? raw.techStack
              .split(',')
              .map((tech) => tech.trim())
              .filter(Boolean)
          : [],
        stars: raw.starCount,
        forks: raw.forkCount,
        updatedAt: raw.updatedAt,
        reason: raw.reason,
      },
    ],
  };
};

const toRecommendations = (data: unknown): Recommendation[] => {
  const list = Array.isArray(data) ? data : data ? [data] : [];
  return (list as (Recommendation | RecommendationRow)[]).map(toRecommendation);
};

// ===== AI 추천 요청 및 재요청 =====
export interface RequestRecommendationBody {
  cardId: number;
  // 재요청 시 이미 추천받은 레포를 다시 안 주기 위해 제외할 레포 id 목록
  excludedRepositoryIds: number[];
}

// 조회와 마찬가지로 명세(객체 하나)와 실제 응답 모양이 다를 수 있어 배열로 맞춰서 반환함
export const postRecommendationRequest = async (
  request: RequestRecommendationBody,
): Promise<Recommendation[]> => {
  const { data } = await apiClient.post<unknown>('/api/recommendations/request', request);
  return toRecommendations(data);
};

// ===== AI 추천 목록 조회 =====
// 명세는 카드 하나당 recommendation 객체 하나라고 되어 있는데, 실제 서버는 배열(없으면 [])로 내려줌
// — 어느 쪽이든 배열로 맞춰서 반환함 (명세와 실제 응답 모양은 백엔드 확인 필요)
export const getRecommendation = async (cardId: number): Promise<Recommendation[]> => {
  const { data } = await apiClient.get<unknown>(`/api/recommendations/cards/${cardId}`);
  return toRecommendations(data);
};

// ===== AI 추천 결과 정렬 =====
// 명세는 GET /recommendations?sortBy= 라고 되어 있지만 실제 서버엔 그 주소가 없고,
// 카드별 조회 주소에 sortBy를 붙여서 정렬해 줌 (GET /recommendations/cards/{cardId}?sortBy=)
export const getSortedRecommendations = async (
  cardId: number,
  sortBy: 'LATEST' | 'STAR' | 'FORK',
): Promise<Recommendation[]> => {
  const { data } = await apiClient.get<unknown>(`/api/recommendations/cards/${cardId}`, {
    params: { sortBy },
  });
  return toRecommendations(data);
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
