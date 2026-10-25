// ===== 타입 =====
export interface RecoItem {
    id : string; //레포 추천 결과의 아이디
    repoName : string;
    repoUrl : string;
    description : string;
    reason : string;
    stars : number;
    forks : number;
    updatedAt : string; // 정렬 : 최근 업데이트 순 때문에..
    // 서버에서 받아온 추천일 때만 있음 — 아이디어로 저장할 때 어떤 추천/레포인지 알려주기 위해 필요
    recommendationId? : number;
    repositoryId? : number;
}

import axios from 'axios';
import {
    getRecommendation,
    getSortedRecommendations,
    patchCancelRecommendation,
    postRecommendationRequest,
} from '@/api/recommendations';
import type { Recommendation, RecommendedRepo } from '@/api/recommendations';

// ===== mock 데이터 =====
export const mockRecoSuccess : RecoItem[] = [
    {
        id : 'reco1',
        repoName : 'facebook/react',
        repoUrl : 'https://github.com/facebook/react',
        description : 'UI 컴포넌트 기반 자바스크립트 라이브러리',
        reason : 'Todo 앱 구현에 가장 널리 쓰이는 핵심 라이브러리예요',
        stars : 218000,
        forks : 44800,
        updatedAt : '2026-06-30',
    },
    {
        id : 'reco2',
        repoName : 'pmndrs/zustand',
        repoUrl : 'https://github.com/pmndrs/zustand',
        description : 'React 상태 관리 라이브러리',
        reason : '할 일 목록 상태를 간결하게 관리할 수 있어요',
        stars : 47100,
        forks : 1500,
        updatedAt : '2026-06-25',
    },
];

//카드를 보냈는데, 매칭되는 레포가 없는 경우
export const mockRecoEmpty : RecoItem[] = [];

// ===== 필터 타입 =====
export type RecoSortOption = 'start_desc' | 'forks_asc' | 'updated_desc';


// ===== 가짜 서버 로직 (카드 넣으면 추천 결과 반환 + 정렬 필터) =====
export const fetchMockRecoItems = async (
    cardId : string, //브레인스토밍 카드 아이디
    sortBy? : RecoSortOption
) : Promise <RecoItem[]> => {
    await new Promise ((r) => setTimeout(r,800));

    if(!cardId) return mockRecoEmpty;

    let result = [...mockRecoSuccess];
    //원본을 복사해서 정렬해서 보여줌

    if(sortBy === 'start_desc'){
        result = result.sort((a,b) => b.stars-a.stars); // 양수면 → b가 a보다 앞으로 옴
    }else if (sortBy === 'forks_asc'){
        result = result.sort ((a,b) => a.forks-b.forks);
    }else if(sortBy === 'updated_desc'){
        result = result.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } //new Date(...)로 날짜 객체로 변환하고, .getTime()으로 **숫자(타임스탬프)**로 바꿔서 뺄셈 가능하게 만듦

    return result;
};

// ===================================================================
// 레코봇 실제 API 연동 (추천 요청/조회/정렬/취소)
// 추천받기 시작 ~ 취소/아이디어 저장까지가 recommendationId 하나(사이클)이고,
// 그 안에서 "다시 추천받기"를 할 때마다 레포가 repositories에 쌓이는 구조
// ===================================================================

export type RecommendationSortOption = 'latest' | 'star' | 'fork';

export interface RecommendedRepository {
    repositoryId: number;
    name: string;
    url: string;
    description: string;
    starCount: number;
    forkCount: number;
    reason: string; // AI가 이 레포를 추천한 이유
    updatedAt?: string;
}

const toRepository = (repo: RecommendedRepo): RecommendedRepository => ({
    repositoryId: repo.repositoryId,
    name: repo.name,
    url: repo.url,
    description: repo.description,
    starCount: repo.stars,
    forkCount: repo.forks,
    reason: repo.reason,
    updatedAt: repo.updatedAt,
});

const formatDotDate = (iso: string) => {
    const date = new Date(iso);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}.${month}.${day}`;
};

// 레포 1개를 카드 상세 화면에서 쓰는 RecoItem 형태로 변환
export const toRecoItem = (recommendationId: number, repo: RecommendedRepository): RecoItem => ({
    id: `repo_${repo.repositoryId}`,
    recommendationId,
    repositoryId: repo.repositoryId,
    repoName: repo.name,
    repoUrl: repo.url,
    description: repo.description,
    reason: repo.reason,
    stars: repo.starCount,
    forks: repo.forkCount,
    updatedAt: repo.updatedAt ? formatDotDate(repo.updatedAt) : '',
});

// ===== 추천 요청 / 다시 추천받기 =====
// excludedRepositoryIds: 이미 추천받은 레포를 또 받지 않도록 제외할 레포 id 목록
// 추천된 레포는 요청 응답에 담겨 오기 때문에 그걸 바로 결과로 돌려줌
export interface RecommendationResultItem {
    recommendationId: number;
    repository: RecommendedRepository;
}

const toResultItems = (recommendations: Recommendation[]): RecommendationResultItem[] =>
    recommendations.flatMap((recommendation) =>
        (recommendation.repositories ?? []).map((repo) => ({
            recommendationId: recommendation.recommendationId,
            repository: toRepository(repo),
        })),
    );

export const requestRecommendation = async (
    cardId: string,
    excludedRepositoryIds: number[] = [],
): Promise<RecommendationResultItem[]> => {
    try {
        const recommendations = await postRecommendationRequest({
            cardId: Number(cardId),
            excludedRepositoryIds,
        });
        return toResultItems(recommendations);
    } catch (error) {
        // 400(카드 내용 없음 등)은 서버가 알려준 문구를 그대로 보여주고, 그 외는 일반 실패로 안내
        const serverMessage = axios.isAxiosError(error) && error.response?.status === 400
            ? (error.response.data as { message?: string } | undefined)?.message
            : undefined;
        throw { message: serverMessage ?? '추천을 가져오지 못했어요.' };
    }
};

// ===== 정렬 조회 (정렬 필터를 골랐을 때) =====
const SORT_BY_MAP = { latest: 'LATEST', star: 'STAR', fork: 'FORK' } as const;

export const fetchSortedRecommendationResults = async (
    sort: RecommendationSortOption,
): Promise<RecommendationResultItem[]> => {
    // 정렬 조회는 카드가 아니라 지금 챗봇에서 진행 중인 추천을 정렬하는 API라 cardId를 받지 않음
    return toResultItems(await getSortedRecommendations(SORT_BY_MAP[sort]));
};

// ===== 추천 취소 (saveHistory: true면 이력 보관, false면 완전 삭제) =====
export const cancelRecommendation = async (
    recommendationId: number,
    saveHistory: boolean,
): Promise<void> => {
    await patchCancelRecommendation(recommendationId, saveHistory);
};

// ===== 카드 상세에 보여줄 보관된 추천 결과 =====
// 추천받은 적 없는 카드는 null (추천 조회 실패가 카드 자체 조회를 막지 않도록 실패도 null로 처리)
export const fetchCardRecoItems = async (cardId: string): Promise<RecoItem[] | null> => {
    try {
        const recommendations = await getRecommendation(Number(cardId));
        const items = toResultItems(recommendations).map((item) =>
            toRecoItem(item.recommendationId, item.repository),
        );

        return items.length > 0 ? items : null;
    } catch {
        return null;
    }
};
