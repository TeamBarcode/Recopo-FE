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
    actorUserId?: string; // FRIEND_REQUEST_RECEIVED 확인 모달 문구용 (@아이디)
    actorProfileImageUrl?: string;
    createdAt: string;
    relatedRequestId?: string; // FRIEND_REQUEST_RECEIVED 수락/거절용
    friendId?: string; // FRIEND_REQUEST_ACCEPTED 클릭 시 이동할 친구 id
    ideaId?: string; // IDEA_LIKED / IDEA_COMMENTED / REPLY_ADDED 클릭 시 이동할 아이디어 id
    commentId?: string; // IDEA_COMMENTED / REPLY_ADDED 클릭 시 스크롤될 댓글 id
    ideaTitle?: string; // IDEA_LIKED 표시용
    commentContent?: string; // IDEA_COMMENTED / REPLY_ADDED 표시용
}

// ===== mock 데이터 =====
// createdAt은 오늘(2026.08.16) 기준 오늘/어제/그저께/최근 7일/예전 5개 그룹이 전부 나오도록 분산시킴
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'FRIEND_REQUEST_ACCEPTED',
    isRead: false,
    actorNickname: '어피치',
    friendId: 'friend2',
    createdAt: '2026.08.16',
  },
  {
    id: 'n2',
    type: 'FRIEND_REQUEST_RECEIVED',
    isRead: false,
    actorNickname: '힘들다',
    actorUserId: 'himdeulda',
    relatedRequestId: 'request_1',
    createdAt: '2026.08.15',
  },
  {
    id: 'n3',
    type: 'IDEA_LIKED',
    isRead: false,
    actorNickname: '어피치',
    ideaId: 'idea1',
    ideaTitle: 'React Todo 앱',
    createdAt: '2026.08.15',
  },
  {
    id: 'n4',
    type: 'IDEA_COMMENTED',
    isRead: false,
    actorNickname: '태영',
    ideaId: 'idea1',
    commentId: 'comment2',
    commentContent: '좋다',
    createdAt: '2026.08.14',
  },
  {
    id: 'n5',
    type: 'REPLY_ADDED',
    isRead: false,
    actorNickname: 'himdleda',
    ideaId: 'idea1',
    commentId: 'comment1',
    commentContent: '감사해요',
    createdAt: '2026.08.10',
  },
  {
    id: 'n6',
    type: 'REPLY_ADDED',
    isRead: false,
    actorNickname: 'himdleda',
    ideaId: 'idea1',
    commentId: 'comment1',
    commentContent: '굿',
    createdAt: '2026.08.09',
  },
  {
    id: 'n7',
    type: 'IDEA_COMMENTED',
    isRead: false,
    actorNickname: '지원',
    ideaId: 'idea1',
    commentId: 'comment1',
    commentContent: '오 이거 좋은데?',
    createdAt: '2026.07.20',
  },
];

// 안 읽은 알림이 하나라도 있는지를 true/false로 알려주는 함수
// (읽은/확인한 알림은 목록에서 아예 제거되는 구조라, 남아있는 알림은 전부 안 읽은 상태임)
export const hasUnreadNotification = (): boolean => {
    return mockNotifications.length > 0;
};

// ===== 알림 목록 조회 (더 보기용) =====
export const fetchMockNotifications = async (
  page: number = 1,
  pageSize: number = 5
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

// ===== 알림 확인(클릭 또는 모두읽음) — 목록에서 완전히 제거됨 =====
export const markMockNotificationRead = async (
  notificationId: string
): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 150));

  const index = mockNotifications.findIndex((n) => n.id === notificationId);
  if (index === -1) {
    throw { message: '존재하지 않는 알림이에요' };
  }
  mockNotifications.splice(index, 1);

  return { success: true };
};

// ===== 모든 알림 확인(모두 읽음 버튼) =====
export const markAllMockNotificationsRead = async (): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 150));
  mockNotifications.length = 0;
  return { success: true };
};
