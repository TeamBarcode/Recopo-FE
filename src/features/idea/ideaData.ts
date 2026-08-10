export type IdeaVisibility = '공개' | '비공개';

export interface Idea {
  id: number;
  title: string;
  tags: string[];
  category: string;
  summary: string;
  repositoryCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  visibility: IdeaVisibility;
}

export const visibilityOptions = ['전체', '공개', '비공개'];
export const categoryOptions = ['전체', '콘텐츠/미디어', '생활', '건강', '업무/도구', '개발/디자인', '사람', '기타'];
export const sortOptions = ['최신순', '오래된순', '좋아요순'];

export const mockIdeas: Idea[] = [
  { id: 1, title: 'React Todo 앱', tags: ['React', '할일'], category: '업무/도구', summary: '브레인스토밍 카드를 바탕으로 할 일을 간편하게 정리하고 관리하는 서비스', repositoryCount: 2, likeCount: 12, commentCount: 2, createdAt: '2026.06.24', visibility: '공개' },
  { id: 2, title: '나만의 운동 루틴 기록', tags: ['루틴', '기록'], category: '건강', summary: '매일의 운동 루틴과 달성률을 기록하고 한눈에 확인하는 아이디어', repositoryCount: 3, likeCount: 8, commentCount: 1, createdAt: '2026.06.21', visibility: '비공개' },
  { id: 3, title: '취향 기반 콘텐츠 큐레이션', tags: ['콘텐츠', '추천'], category: '콘텐츠/미디어', summary: '사용자가 좋아한 콘텐츠를 바탕으로 다음 작품을 추천하는 서비스', repositoryCount: 2, likeCount: 19, commentCount: 4, createdAt: '2026.06.18', visibility: '공개' },
  { id: 4, title: '동네 식물 돌봄 모임', tags: ['식물', '커뮤니티'], category: '사람', summary: '여행이나 외출 중 이웃과 서로의 식물을 돌봐주는 커뮤니티 아이디어', repositoryCount: 1, likeCount: 6, commentCount: 3, createdAt: '2026.06.12', visibility: '공개' },
  { id: 5, title: '포트폴리오 피드백 보드', tags: ['포트폴리오', '디자인'], category: '개발/디자인', summary: '작업물을 공유하고 항목별 피드백을 주고받을 수 있는 협업 보드', repositoryCount: 4, likeCount: 15, commentCount: 5, createdAt: '2026.06.08', visibility: '비공개' },
  { id: 6, title: '냉장고 재료 알림', tags: ['생활', '알림'], category: '생활', summary: '보관 중인 재료의 소비 기한을 알려주고 가능한 요리를 제안하는 서비스', repositoryCount: 2, likeCount: 10, commentCount: 2, createdAt: '2026.06.03', visibility: '공개' },
];
