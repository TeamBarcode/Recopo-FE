import { useEffect, useState } from 'react';
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
    const [actionTarget, setActionTarget] = useState<{ notification: Notification; action: 'accept' | 'reject' } | null>(null);

    useEffect(() => {
        fetchMockNotifications(1).then(({ notifications: list, hasMore: more }) => {
            setNotifications(list);
            setHasMore(more);
        });
    }, []);

    // 남은 알림을 한 번에 전부 불러옴 — 이후엔 패널 안에서 스크롤로 전부 확인 가능
    const handleLoadMore = async () => {
        const { notifications: list, hasMore: more } = await fetchMockNotifications(1, mockNotifications.length);
        setNotifications(list);
        setHasMore(more);
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
                    // TODO(2차): feat/friends-page가 dev에 merge되어 FriendsPage가 friendId 쿼리
                    // 파라미터로 해당 친구를 자동 선택하도록 지원하면 그 흐름과 맞춰서 확인
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
            await acceptMockFriendRequest(notification.relatedRequestId);
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

const Panel = styled.div`
    position: absolute;
    top: calc(100% + 12px);
    right: -12px;
    width: 352px;
    max-height: 480px;
    overflow-y: auto;
    background: ${tokens.colors.background};
    border-radius: ${tokens.radius.md};
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
    padding: 16px 20px;
    z-index: 1000;
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    margin: 12px 0 8px;
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
