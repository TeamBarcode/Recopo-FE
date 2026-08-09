import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import { fetchMockNotifications } from '@/mocks/notifications';
import type { Notification } from '@/mocks/notifications';
import { acceptMockFriendRequest, rejectMockFriendRequest } from '@/mocks/friends';
import Avatar from '@/components/common/Avatar';

interface NotificationPanelProps {
    onUnreadChange: (hasUnread: boolean) => void;
}

type GroupLabel = '오늘' | '어제' | '최근 7일' | '이전';

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
    if (diffDays <= 7) return '최근 7일';
    return '이전';
};

const GROUP_ORDER: GroupLabel[] = ['오늘', '어제', '최근 7일', '이전'];

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

function NotificationPanel({ onUnreadChange }: NotificationPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [resolvedRequestIds, setResolvedRequestIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchMockNotifications(1).then(({ notifications: list, hasMore: more }) => {
            setNotifications(list);
            setHasMore(more);
            setPage(1);
        });
    }, []);

    useEffect(() => {
        onUnreadChange(notifications.some((n) => !n.isRead));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        const { notifications: list, hasMore: more } = await fetchMockNotifications(nextPage);
        setNotifications((prev) => [...prev, ...list]);
        setHasMore(more);
        setPage(nextPage);
    };

    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleClickNotification = (notification: Notification) => {
        if (notification.isRead) return;
        setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
    };

    const handleAccept = async (event: React.MouseEvent, notification: Notification) => {
        event.stopPropagation();
        if (!notification.relatedRequestId) return;
        await acceptMockFriendRequest(notification.relatedRequestId);
        setResolvedRequestIds((prev) => new Set(prev).add(notification.relatedRequestId!));
        setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
    };

    const handleReject = async (event: React.MouseEvent, notification: Notification) => {
        event.stopPropagation();
        if (!notification.relatedRequestId) return;
        await rejectMockFriendRequest(notification.relatedRequestId);
        setResolvedRequestIds((prev) => new Set(prev).add(notification.relatedRequestId!));
        setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
    };

    const groups = groupNotifications(notifications);

    return (
        <Panel role="dialog" aria-label="알림">
            <TopBar>
                <MarkAllReadButton type="button" onClick={handleMarkAllRead}>
                    모두 읽음
                </MarkAllReadButton>
            </TopBar>

            {groups.length === 0 && <EmptyText>알림이 없어요</EmptyText>}

            {groups.map((group) => (
                <Group key={group.label}>
                    <GroupLabelText>{group.label}</GroupLabelText>
                    {group.items.map((notification) => {
                        const showActions =
                            notification.type === 'FRIEND_REQUEST_RECEIVED' &&
                            notification.relatedRequestId &&
                            !resolvedRequestIds.has(notification.relatedRequestId);

                        return (
                            <NotificationRow
                                key={notification.id}
                                onClick={() => handleClickNotification(notification)}
                            >
                                <Avatar size="xs" src={notification.actorProfileImageUrl} />
                                <NotificationMessage $isRead={notification.isRead}>
                                    {notification.message}
                                </NotificationMessage>
                                {showActions && (
                                    <ActionRow>
                                        <ActionButton
                                            type="button"
                                            aria-label="수락"
                                            onClick={(e) => handleAccept(e, notification)}
                                        >
                                            ✓
                                        </ActionButton>
                                        <ActionButton
                                            type="button"
                                            aria-label="거절"
                                            onClick={(e) => handleReject(e, notification)}
                                        >
                                            ✕
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
                    더 많이 보기 ⌄
                </LoadMoreButton>
            )}
        </Panel>
    );
}

export default NotificationPanel;

const Panel = styled.div`
    position: absolute;
    top: calc(100% + 12px);
    right: -12px;
    width: 350px;
    max-height: 480px;
    overflow-y: auto;
    background: ${tokens.colors.background};
    border-radius: ${tokens.radius.lg};
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
    padding: 16px 20px;
    z-index: 1000;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
`;

const MarkAllReadButton = styled.button`
    border: 1px solid ${tokens.colors.border.search};
    border-radius: ${tokens.radius.xs};
    background: ${tokens.colors.background};
    padding: 6px 12px;
    font-size: ${tokens.fontSize.sm};
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
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
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
    margin-bottom: 8px;
`;

const NotificationRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    cursor: pointer;
`;

const NotificationMessage = styled.div<{ $isRead: boolean }>`
    flex: 1;
    font-size: ${tokens.fontSize.md};
    color: ${({ $isRead }) => ($isRead ? tokens.colors.text.extraLight : tokens.colors.text.primary)};
    font-weight: ${({ $isRead }) => ($isRead ? tokens.fontWeight.regular : tokens.fontWeight.medium)};
`;

const ActionRow = styled.div`
    display: flex;
    gap: 6px;
    flex-shrink: 0;
`;

const ActionButton = styled.button`
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid ${tokens.colors.border.search};
    background: ${tokens.colors.background};
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
        opacity: 0.6;
    }
`;

const LoadMoreButton = styled.button`
    display: block;
    margin: 12px auto 0;
    border: none;
    background: transparent;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
    cursor: pointer;
`;
