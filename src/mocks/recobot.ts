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
}

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
// 아래부터는 AI 담당자가 준 실제 API 문서(추천 요청/조회/취소/재요청/idea 저장) 기준.
// 위쪽 RecoItem/fetchMockRecoItems는 다른 화면(카드·아이디어 상세)에서 이미 쓰고 있어서 그대로 둠.
// ===================================================================

export type RecommendationStatus = 'COMPLETED' | 'CANCELED' | 'FAILED';

export type RecommendationSortOption = 'latest' | 'star' | 'fork';

export interface RecommendedRepository {
    repositoryId: number;
    name: string;
    url: string;
    description: string;
    starCount: number;
    forkCount: number;
    reason: string; // AI가 이 레포를 추천한 이유
}

export interface Recommendation {
    recommendationId: number;
    cardId: string;
    content: string;
    status: RecommendationStatus;
    createdAt: string;
    repositories?: RecommendedRepository[]; // 목록 조회(정렬 없이)는 이 필드가 없고, 정렬 조회일 때만 채워짐
}

let recommendationIdSeq = 100;
const mockRecommendations: Recommendation[] = [];

// 실제로는 AI가 한 번 요청할 때마다 레포 1개를 추천해줌 (재요청하면 또 1개가 목록에 쌓이는 구조)
const MOCK_REPOSITORY_POOL: RecommendedRepository[] = [
    {
        repositoryId: 1,
        name: 'facebook/react',
        url: 'https://github.com/facebook/react',
        description: 'UI 컴포넌트 기반 자바스크립트 라이브러리',
        starCount: 218000,
        forkCount: 44800,
        reason: 'Todo 앱 구현에 가장 널리 쓰이는 핵심 라이브러리예요',
    },
    {
        repositoryId: 2,
        name: 'pmndrs/zustand',
        url: 'https://github.com/pmndrs/zustand',
        description: 'React 상태 관리 라이브러리',
        starCount: 47100,
        forkCount: 1500,
        reason: '할 일 목록 상태를 간결하게 관리할 수 있어요',
    },
    {
        repositoryId: 3,
        name: 'tanstack/query',
        url: 'https://github.com/TanStack/query',
        description: '서버 상태 캐싱/동기화 라이브러리',
        starCount: 43200,
        forkCount: 2900,
        reason: 'API로 받아온 데이터를 효율적으로 캐싱할 수 있어요',
    },
];

// ===== 추천 요청 (POST /cards/{cardId}/recommendations) =====
// 재요청도 같은 엔드포인트: 부를 때마다 새 recommendationId로 레포 1개가 새로 쌓이고, 기존 건 안 지워짐
export const requestMockRecommendation = async (
    cardId: string,
    title: string,
    content: string,
): Promise<Recommendation> => {
    await new Promise((r) => setTimeout(r, 800));

    if (!content) {
        // 실제 400 Bad Request 응답 형태 그대로
        throw {
            timestamp: new Date().toISOString(),
            status: 400,
            error: 'Bad Request',
            message: '선택된 카드의 내용이 없습니다.',
            path: `/cards/${cardId}/recommendations`,
        };
    }

    const repo = MOCK_REPOSITORY_POOL[recommendationIdSeq % MOCK_REPOSITORY_POOL.length];

    const recommendation: Recommendation = {
        recommendationId: recommendationIdSeq++,
        cardId,
        content: `${title} 아이디어에 대한 추천`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        repositories: [repo],
    };

    mockRecommendations.push(recommendation);
    return recommendation;
};

// ===== 추천 목록/정렬 조회 (GET /cards/{cardId}/recommendations?sort=) =====
export const fetchMockRecommendations = async (
    cardId: string,
    sort?: RecommendationSortOption,
): Promise<Recommendation[]> => {
    await new Promise((r) => setTimeout(r, 300));

    let result = mockRecommendations.filter((r) => r.cardId === cardId);

    if (sort === 'star') {
        result = [...result].sort(
            (a, b) => (b.repositories?.[0]?.starCount ?? 0) - (a.repositories?.[0]?.starCount ?? 0),
        );
    } else if (sort === 'fork') {
        result = [...result].sort(
            (a, b) => (a.repositories?.[0]?.forkCount ?? 0) - (b.repositories?.[0]?.forkCount ?? 0),
        );
    } else {
        // 정렬 필터를 안 골랐을 때 기본값: 가장 최근에 추천받은 게 위로 오게 ('latest'와 동일한 순서)
        result = [...result].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    return result;
};

// ===== 추천 내역 보관을 거절했을 때: 이 카드에 대해 생성했던 추천을 전부 지움 =====
export const deleteMockRecommendationsForCard = async (cardId: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));

    for (let i = mockRecommendations.length - 1; i >= 0; i--) {
        if (mockRecommendations[i].cardId === cardId) {
            mockRecommendations.splice(i, 1);
        }
    }
};

// ===== 추천 취소 (PATCH /recommendations/{recommendationId}) =====
export const cancelMockRecommendation = async (
    recommendationId: number,
): Promise<{ status: 'CANCELED' }> => {
    await new Promise((r) => setTimeout(r, 300));

    const target = mockRecommendations.find((r) => r.recommendationId === recommendationId);
    if (target) {
        target.status = 'CANCELED';
    }

    return { status: 'CANCELED' };
};

// ===== 추천을 idea로 저장 (POST /ideas) =====
export interface SavedIdeaFromRecommendation {
    ideaId: number;
    recommendationId: number;
    title: string;
    content: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    createdAt: string;
}

export const saveMockRecommendationAsIdea = async (
    recommendationId: number,
    visibility: 'PRIVATE' | 'PUBLIC',
): Promise<SavedIdeaFromRecommendation> => {
    await new Promise((r) => setTimeout(r, 500));

    const target = mockRecommendations.find((r) => r.recommendationId === recommendationId);
    if (!target) {
        throw { message: '존재하지 않는 추천이에요' };
    }

    return {
        ideaId: Date.now(),
        recommendationId,
        title: target.content,
        content: target.content,
        visibility,
        createdAt: new Date().toISOString(),
    };
};

// 새 RecommendedRepository(레포 1개)를 옛날부터 쓰던 RecoItem 형태로 변환
// (BrainstormCardDetail.recoBotResult / IdeaCard.recoBotResult가 아직 RecoItem[] 타입이라 이 형태를 맞춰줘야 함)
export const toRecoItem = (repo: RecommendedRepository): RecoItem => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

    return {
        id: `repo_${repo.repositoryId}_${Date.now()}`,
        repoName: repo.name,
        repoUrl: repo.url,
        description: repo.description,
        reason: repo.reason,
        stars: repo.starCount,
        forks: repo.forkCount,
        updatedAt: formattedDate,
    };
};