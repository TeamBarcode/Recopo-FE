import { apiClient } from './client';

// 추천을 선택해 저장한 아이디어에만 들어오고, 추천 없이 저장했으면 null
// (백엔드 IdeaResponseDto.RecommendationResponse 기준 — 레코봇 추천 API의 레포 필드 이름과 다름)
export interface IdeaRecommendation {
  recommendationId: number;
  repositoryId: number;
  repositoryName: string;
  repositoryFullName: string;
  repositoryUrl: string;
  repositoryDescription: string;
  language: string;
  // 콤마(", ")로 이어붙인 하나의 문자열 (예: "Spring, JPA")
  techStack: string;
  starCount: number;
  forkCount: number;
  updatedAt: string;
  reason: string;
}

export interface Idea {
  ideaId: number;
  title: string;
  content: string;
  // 명세 예시엔 콤마 구분 단일 문자열로 내려옴(예: "#AI,#카페")
  hashtag: string;
  category: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  likeCount: number;
  // 명세엔 있지만 실제 서버 응답(IdeaResponseDto)엔 아직 없음
  commentCount?: number;
  createdAt: string;
  recommendation?: IdeaRecommendation | null;
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
  cardId: number,
  request: SaveIdeaFromCardRequest,
): Promise<Idea> => {
  const { data } = await apiClient.post<Idea>(`/api/ideas/cards/${cardId}/ideas`, request);
  return data;
};

// ===== 좋아요한 아이디어 목록 조회 (마이페이지) =====
// likedAt(내가 좋아요 누른 시각) 내림차순으로 정렬돼서 내려옴
// 백엔드 LikedIdeaResponse 기준 (명세서의 thumbnailUrl/likedByMe/updatedAt은 실제 서버가 주지 않음)
export interface LikedIdea {
  ideaId: number;
  memberId: number;
  nickname: string;
  title: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  likedAt: string;
  createdAt: string;
}

export interface LikedIdeasResponse {
  ideas: LikedIdea[];
}

// 명세는 { ideas: [...] }인데 실제 서버는 빈 목록일 때 []를 바로 내려줌 — 두 모양 모두 처리
// (좋아요가 있을 때의 실제 응답 모양은 백엔드 확인 필요)
export const getLikedIdeas = async (): Promise<LikedIdea[]> => {
  const { data } = await apiClient.get<LikedIdeasResponse | LikedIdea[]>('/api/ideas/liked');
  return Array.isArray(data) ? data : data.ideas;
};
