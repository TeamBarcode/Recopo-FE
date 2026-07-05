// ===== 타입 =====
export interface Notification {
    id: string;
    type:
        | 'FRIEND_REQUEST_ACCEPTED'
        | 'FRIEND_REQUEST_RECEIVED'
        | 'IDEA_LIKED'
        | 'IDEA_COMMENTED'
        | 'REPLY_ADDED';
    isRead: boolean;
    actorNickname: string;
    actorProfileImageUrl?: string;
    message: string;
    createdAt: string;
    relatedRequestId?: string;
}

// ===== mock 데이터 =====
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'FRIEND_REQUEST_ACCEPTED',
    isRead: false,
    actorNickname: '태영',
    message: '태영님이 친구 요청을 수락했어요',
    createdAt: '2026.07.06',
  },
  {
    id: 'n2',
    type: 'FRIEND_REQUEST_RECEIVED',
    isRead: false,
    actorNickname: '힘들다',
    message: '힘들다님이 친구 요청을 보냈어요',
    createdAt: '2026.07.05',
    relatedRequestId: 'request_1',
  },
  {
    id: 'n3',
    type: 'IDEA_LIKED',
    isRead: true,
    actorNickname: '어피치',
    message: '어피치님이 회원님의 아이디어를 좋아요를 남겼어요',
    createdAt: '2026.07.05',
  },
  {
    id: 'n4',
    type: 'IDEA_COMMENTED',
    isRead: true,
    actorNickname: '어피치',
    message: '어피치님이 회원님의 아이디어에 댓글을 남겼어요',
    createdAt: '2026.07.05',
  },
  {
    id: 'n5',
    type: 'REPLY_ADDED',
    isRead: true,
    actorNickname: 'himdleda',
    message: 'himdleda님이 답글을 남겼어요',
    createdAt: '2026.06.30',
  },
  {
    id: 'n6',
    type: 'REPLY_ADDED',
    isRead: true,
    actorNickname: 'himdleda',
    message: 'himdleda님이 답글을 남겼어요',
    createdAt: '2026.06.30',
  },
  {
    id: 'n7',
    type: 'REPLY_ADDED',
    isRead: true,
    actorNickname: 'himdleda',
    message: 'himdleda님이 답글을 남겼어요',
    createdAt: '2026.06.30',
  },
];

// 안 읽은 알림이 하나라도 있는지"를 true/false로 알려주는 함수
export const hasUnreadNotification = () : boolean => {
    return mockNotifications.some((n) => !n.isRead);
    // n1을 검사할 때 true가 나옴 → "하나라도 있다" 조건 충족 → some()은 즉시 true 반환
};

//나중에 header.tsx에서 true면 빨간 점 표시

// ===== 알림 목록 조회 (더 보기용) =====
export const fetchMockNotifications = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ notifications: Notification[]; hasMore: boolean }> => {
  await new Promise((r) => setTimeout(r, 300));

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const sliced = mockNotifications.slice(start, end);

  return {
    notifications: sliced,
    hasMore: end < mockNotifications.length,
  };
};
//오늘, 어제, 최근 7일로 나누는 건 컴포넌트가 받은 데이터를 createdAt 기준으로 그룹핑해서 보여주는 화면 로직
//보여줄 전체 알림 개수만 제한한 다음에 그룹핑하면 될 것 같음