export interface Notification {
    id : string;
    isRead : boolean;
    content : string;
    createdAt : string;
}

export const mockNotifications : Notification [] = [
    { id : 'n1', isRead : false, content : '지원님이 댓글을 달았어요', createdAt : '2026.07.04' },
    { id: 'n2', isRead : false, content : '어피치님이 좋아요를 눌렀어요', createdAt : '2026.07.03'},
];

// 안 읽은 알림이 하나라도 있는지"를 true/false로 알려주는 함수
export const hasUnreadNotification = () : boolean => {
    return mockNotifications.some((n) => !n.isRead);
    // n1을 검사할 때 true가 나옴 → "하나라도 있다" 조건 충족 → some()은 즉시 true 반환
};

//나중에 header.tsx에서 true면 빨간 점 표시