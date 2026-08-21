import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import {
    fetchMockNotifications,
    markMockNotificationRead,
    markAllMockNotificationsRead,
    mockNotifications,
} from '@/mocks/notifications';
import type { Notification } from '@/mocks/notifications';
import { acceptMockFriendRequest, rejectMockFriendRequest } from '@/mocks/friends';
import Avatar from '@/components/common/Avatar';
import Modal from '@/components/common/Modal';
import acceptIcon from '@/assets/notification-accept.svg';
import rejectIcon from '@/assets/notification-reject.svg';
import chevronIcon from '@/assets/notification-chevron.svg';

interface NotificationPanelProps {
    onNavigate: () => void;
}

type GroupLabel = '오늘' | '어제' | '그저께' | '최근 7일' | '예전';

// createdAt('YYYY.MM.DD')과 오늘 날짜를 비교해서 그룹 라벨을 정함
const getGroupLabel = (createdAt: string): GroupLabel => {
    const [y, m, d] = createdAt.split('.').map(Number);
    const created = new Date(y, (m ?? 1) - 1, d ?? 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    created.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays === 2) return '그저께';
    if (diffDays <= 7) return '최근 7일';
    return '예전';
};

const GROUP_ORDER: GroupLabel[] = ['오늘', '어제', '그저께', '최근 7일', '예전'];

function groupNotifications(notifications: Notification[]) {
    const groups = new Map<GroupLabel, Notification[]>();
    notifications.forEach((n) => {
        const label = getGroupLabel(n.createdAt);
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(n);
    });
    return GROUP_ORDER.filter((label) => groups.has(label)).map((label) => ({
        label,
        items: groups.get(label)!,
    }));
}

// 알림 타입별로 [닉네임(semibold)] + [연결 문구(light)] + [대상 텍스트(regular)] 조합을 렌더링
function NotificationMessageContent({ notification }: { notification: Notification }) {
    const actor = <ActorName>{notification.actorNickname}</ActorName>;

    switch (notification.type) {
        case 'FRIEND_REQUEST_ACCEPTED':
            return <>{actor}<LightText>님이 친구 요청을 수락했어요</LightText></>;
        case 'FRIEND_REQUEST_RECEIVED':
            return <>{actor}<LightText>님이 친구 요청을 보냈어요</LightText></>;
        case 'IDEA_LIKED':
            return <>{actor}<LightText>님이 회원님의 아이디어를 좋아해요: </LightText><TargetText>{notification.ideaTitle}</TargetText></>;
        case 'IDEA_COMMENTED':
            return <>{actor}<LightText>님이 남긴 댓글: </LightText><TargetText>{notification.commentContent}</TargetText></>;
        case 'REPLY_ADDED':
            return <>{actor}<LightText>님의 답글: </LightText><TargetText>{notification.commentContent}</TargetText></>;
        default:
            return null;
    }
}

function NotificationPanel({ onNavigate }: NotificationPanelProps) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasMore, setHasMore] = useState(false);
    // "더 보기"를 누르기 전까지는 스크롤 자체가 생기면 안 되므로, 누른 뒤에만 패널 높이를 제한함
    const [isExpanded, setIsExpanded] = useState(false);
    // "더 보기"를 누르기 직전(=5개만 보이던 상태)의 실제 렌더링 높이를 그대로 고정값으로 씀 —
    // 그래야 클릭 전후로 패널 자체 높이는 안 변하고 늘어난 항목은 그 안에서만 스크롤됨
    const [fixedHeight, setFixedHeight] = useState<number | null>(null);
    const listScrollRef = useRef<HTMLDivElement>(null);
    const [actionTarget, setActionTarget] = useState<{ notification: Notification; action: 'accept' | 'reject' } | null>(null);

    useEffect(() => {
        fetchMockNotifications(1).then(({ notifications: list, hasMore: more }) => {
            setNotifications(list);
            setHasMore(more);
        });
    }, []);

    // 남은 알림을 한 번에 전부 불러옴 — 이후엔 패널 안에서 스크롤로 전부 확인 가능
    const handleLoadMore = async () => {
        if (listScrollRef.current) {
            setFixedHeight(listScrollRef.current.offsetHeight);
        }
        const { notifications: list, hasMore: more } = await fetchMockNotifications(1, mockNotifications.length);
        setNotifications(list);
        setHasMore(more);
        setIsExpanded(true);
    };

    const handleMarkAllRead = async () => {
        await markAllMockNotificationsRead();
        setNotifications([]);
        setHasMore(false);
    };

    // 알림 클릭 시: 목록에서 제거 + 타입별로 관련 화면으로 이동
    const handleClickNotification = async (notification: Notification) => {
        await markMockNotificationRead(notification.id);
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

        switch (notification.type) {
            case 'FRIEND_REQUEST_ACCEPTED':
                if (notification.friendId) {
                    navigate(`/friends?friendId=${notification.friendId}`);
                    onNavigate();
                }
                break;
            case 'IDEA_LIKED':
                if (notification.ideaId) {
                    navigate(`/ideas/${notification.ideaId}`);
                    onNavigate();
                }
                break;
            case 'IDEA_COMMENTED':
            case 'REPLY_ADDED':
                if (notification.ideaId) {
                    const commentParam = notification.commentId ? `&commentId=${notification.commentId}` : '';
                    navigate(`/ideas/${notification.ideaId}?openComments=1${commentParam}`);
                    onNavigate();
                }
                break;
            default:
                break;
        }
    };

    const handleRequestAction = (
        event: React.MouseEvent,
        notification: Notification,
        action: 'accept' | 'reject',
    ) => {
        event.stopPropagation();
        setActionTarget({ notification, action });
    };

    const handleConfirmAction = async () => {
        if (!actionTarget) return;
        const { notification, action } = actionTarget;
        if (!notification.relatedRequestId) return;

        if (action === 'accept') {
            await acceptMockFriendRequest(notification.relatedRequestId, {
                userId: notification.actorUserId ?? notification.actorNickname,
                nickname: notification.actorNickname,
                profileImageUrl: notification.actorProfileImageUrl,
            });
        } else {
            await rejectMockFriendRequest(notification.relatedRequestId);
        }
        await markMockNotificationRead(notification.id);
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        setActionTarget(null);
    };

    const groups = groupNotifications(notifications);

    const confirmMessage = actionTarget
        ? `${actionTarget.notification.actorNickname}(@${actionTarget.notification.actorUserId ?? ''})님의 친구 요청을 ${
              actionTarget.action === 'accept' ? '수락할까요?' : '정말 거절하시겠어요?'
          }`
        : '';

    return (
        <Panel role="dialog" aria-label="알림">
            <TopBar>
                <PanelTitle>알림</PanelTitle>
                <MarkAllReadButton type="button" onClick={handleMarkAllRead}>
                    모두 읽음
                </MarkAllReadButton>
            </TopBar>

            <Divider />

            <ListScroll ref={listScrollRef} $expanded={isExpanded} $fixedHeight={fixedHeight ?? undefined}>
                {groups.length === 0 && <EmptyText>알림이 없어요</EmptyText>}

                {groups.map((group) => (
                    <Group key={group.label}>
                        <GroupLabelText>{group.label}</GroupLabelText>
                        {group.items.map((notification) => {
                            const showActions =
                                notification.type === 'FRIEND_REQUEST_RECEIVED' && notification.relatedRequestId;

                            return (
                                <NotificationRow
                                    key={notification.id}
                                    onClick={() => handleClickNotification(notification)}
                                >
                                    <Avatar size="sm" src={notification.actorProfileImageUrl} />
                                    <NotificationMessage>
                                        <NotificationMessageContent notification={notification} />
                                    </NotificationMessage>
                                    {showActions && (
                                        <ActionRow>
                                            <ActionButton
                                                type="button"
                                                aria-label="수락"
                                                onClick={(e) => handleRequestAction(e, notification, 'accept')}
                                            >
                                                <img src={acceptIcon} alt="" />
                                            </ActionButton>
                                            <ActionButton
                                                type="button"
                                                aria-label="거절"
                                                onClick={(e) => handleRequestAction(e, notification, 'reject')}
                                            >
                                                <img src={rejectIcon} alt="" />
                                            </ActionButton>
                                        </ActionRow>
                                    )}
                                </NotificationRow>
                            );
                        })}
                    </Group>
                ))}

                {hasMore && (
                    <LoadMoreButton type="button" onClick={handleLoadMore}>
                        더 많이 보기 <img src={chevronIcon} alt="" />
                    </LoadMoreButton>
                )}
            </ListScroll>

            <Modal
                type="confirm"
                isOpen={!!actionTarget}
                onClose={() => setActionTarget(null)}
                onConfirm={handleConfirmAction}
                message={confirmMessage}
            />
        </Panel>
    );
}

export default NotificationPanel;

/* 스크롤은 이 Panel이 아니라 안쪽 ListScroll에서만 일어남 — Panel에 overflow와
   border-radius를 같이 주면 스크롤바 위아래가 둥근 모서리에 잘려 보이는 문제가 있어서
   (표준 scrollbar-color 렌더링에서는 트랙에 margin을 줘도 무시됨), 아예 모서리가
   둥글지 않은 별도 박스에서 스크롤하도록 분리함 */
const Panel = styled.div`
    position: absolute;
    top: calc(100% + 12px);
    right: -12px;
    width: 352px;
    background: ${tokens.colors.background};
    border-radius: ${tokens.radius.md};
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
    padding: 16px 0;
    z-index: 1000;

    /* 좁은 화면에서는 알림 아이콘 기준 절대배치라 패널이 화면 왼쪽으로 잘려 나가서,
       뷰포트 기준 고정폭으로 전환함(헤더 높이 120px + 12px 간격) */
    @media (max-width: 480px) {
        position: fixed;
        top: 132px;
        left: 12px;
        right: 12px;
        width: auto;
    }
`;

const ListScroll = styled.div<{ $expanded: boolean; $fixedHeight?: number }>`
    /* "더 보기"를 누르기 전까지는 내용만큼 자연스럽게 늘어나다가(스크롤 없음),
       누른 순간의 높이를 그대로 고정값으로 박아서 그 이후엔 패널 높이가 안 변하고
       늘어난 항목만 이 안에서 스크롤되게 함 */
    ${({ $expanded, $fixedHeight }) =>
        $expanded && $fixedHeight ? `height: ${$fixedHeight}px;` : ''}
    /* 뷰포트가 낮을 때 패널이 화면 아래로 잘려서 "더 보기"조차 못 누르는 문제 방지 —
       헤더/상단바/구분선/패딩이 차지하는 공간(대략 200px)을 뺀 나머지를 넘지 않게 함 */
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    /* 스크롤바는 패널 오른쪽 끝에 여백 없이 딱 붙게 두고(padding은 스크롤바 바깥이 아니라
       안쪽 콘텐츠에만 적용됨), 콘텐츠만 좌우 패딩으로 다른 요소들과 맞춤 */
    padding-left: 20px;
    padding-right: 14px;

    /* 얇고 옅은 스크롤바 */
    scrollbar-width: thin;
    scrollbar-color: ${tokens.colors.border.secondary} transparent;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${tokens.colors.border.secondary};
        border-radius: 9999px;
    }
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
`;

const PanelTitle = styled.div`
    font-size: ${tokens.fontSize.xl};
`;

const MarkAllReadButton = styled.button`
    border: 1px solid ${tokens.colors.border.secondary};
    border-radius: ${tokens.radius.xs};
    background: ${tokens.colors.background};
    padding: 6px 12px;
    font-size: ${tokens.fontSize.md};
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;

const Divider = styled.div`
    height: 1px;
    background: #dddddd;
    margin: 12px 20px 20px;
`;

const EmptyText = styled.div`
    text-align: center;
    padding: 24px 0;
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.extraLight};
`;

const Group = styled.div`
    & + & {
        margin-top: 16px;
    }
`;

const GroupLabelText = styled.div`
    font-size: 13px;
    font-weight: ${tokens.fontWeight.light};
    color: ${tokens.colors.text.extraLight};
    margin-bottom: 8px;
`;

const NotificationRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    cursor: pointer;
`;

const NotificationMessage = styled.div`
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.26;
    color: ${tokens.colors.text.primary};

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const ActorName = styled.span`
    font-weight: ${tokens.fontWeight.semibold};
`;

const LightText = styled.span`
    font-weight: ${tokens.fontWeight.light};
`;

const TargetText = styled.span`
    font-weight: ${tokens.fontWeight.regular};
`;

const ActionRow = styled.div`
    display: flex;
    gap: 10px;
    flex-shrink: 0;
`;

const ActionButton = styled.button`
    border: none;
    background: transparent;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
        opacity: 0.6;
    }
`;

const LoadMoreButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    margin-top: 12px;
    border: none;
    background: transparent;
    font-size: 13px;
    color: ${tokens.colors.text.primary};
    cursor: pointer;
`;
