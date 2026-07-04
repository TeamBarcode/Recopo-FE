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