import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Avatar from '@/components/common/Avatar';
import ErrorState from '@/components/common/ErrorState';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import { tokens } from '@/styles/tokens';
import { getFriends } from '@/api/friends';
import type { Friend } from '@/api/friends';
import { getLikedIdeas } from '@/api/idea';
import type { LikedIdea } from '@/api/idea';
import { deleteIdeaLike } from '@/api/social';

const formatDate = (iso: string) => {
    const date = new Date(iso);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}.${month}.${day}`;
};

function LikedIdeasBoard() {
    const navigate = useNavigate();
    const [likedIdeas, setLikedIdeas] = useState<LikedIdea[]>([]);
    const [friendsById, setFriendsById] = useState<Record<number, Friend>>({});
    const [unlikeTargetId, setUnlikeTargetId] = useState<number | null>(null);
    const [isUnlikeFailedModalOpen, setIsUnlikeFailedModalOpen] = useState(false);
    const isUnlikingRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        Promise.all([
            getLikedIdeas().then(setLikedIdeas),
            // 친구 목록은 프로필 사진/클릭 이동용 부가 정보라 실패해도 목록 자체는 보여줌
            getFriends()
                .then(({ friends }) => {
                    const map: Record<number, Friend> = {};
                    friends.forEach((friend) => {
                        map[friend.memberId] = friend;
                    });
                    setFriendsById(map);
                })
                .catch(() => {}),
        ])
            .then(() => {
                setError(null);
                setIsLoading(false);
            })
            .catch(() => setError('좋아요한 아이디어를 불러오지 못했어요'));
    }, [retryCount]);

    const handleConfirmUnlike = async () => {
        const ideaId = unlikeTargetId;
        if (ideaId === null || isUnlikingRef.current) return;
        isUnlikingRef.current = true;

        setUnlikeTargetId(null);
        try {
            await deleteIdeaLike(ideaId);
            setLikedIdeas((prev) => prev.filter((idea) => idea.ideaId !== ideaId));
        } catch {
            setIsUnlikeFailedModalOpen(true);
        } finally {
            isUnlikingRef.current = false;
        }
    };

    return (
        <Wrapper>
            <Title>좋아요한 아이디어</Title>

            {error ? (
                <ErrorState
                    title={error}
                    description="잠시 후 다시 시도해주세요"
                    actionLabel="다시 시도"
                    onAction={() => setRetryCount((count) => count + 1)}
                    minHeight="480px"
                    size="lg"
                />
            ) : isLoading ? (
                <Loading minHeight="480px" />
            ) : (
            <ListBox>
                {likedIdeas.map((idea) => {
                    const author = friendsById[idea.memberId];

                    const handleOpenIdea = () => {
                        navigate(`/friends?friendId=${idea.memberId}&ideaId=${idea.ideaId}`);
                    };

                    return (
                        <Row
                            key={idea.ideaId}
                            role="button"
                            tabIndex={0}
                            onClick={handleOpenIdea}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleOpenIdea();
                                }
                            }}
                        >
                            <AuthorGroup
                                $clickable={Boolean(author)}
                                onClick={(e) => {
                                    if (!author) return;
                                    e.stopPropagation();
                                    navigate(`/friends?friendId=${idea.memberId}`);
                                }}
                            >
                                <Avatar src={author?.profileImageUrl} size="sm" />
                                <Nickname>{author?.nickname ?? idea.nickname}</Nickname>
                            </AuthorGroup>

                            <IdeaInfo>
                                <IdeaTitle>{idea.title}</IdeaTitle>
                                <IdeaMeta>· {formatDate(idea.updatedAt)}</IdeaMeta>
                            </IdeaInfo>

                            <LikeButton
                                type="button"
                                aria-label="좋아요 취소"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUnlikeTargetId(idea.ideaId);
                                }}
                            >
                                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10 18C10 18 0 11.36 0 5.28C0 2.36 2.35 0 5.25 0C7.02 0 8.58 0.88 9.5 2.22C9.65 2.44 10.35 2.44 10.5 2.22C11.42 0.88 12.98 0 14.75 0C17.65 0 20 2.36 20 5.28C20 11.36 10 18 10 18Z"
                                        fill={tokens.colors.button.like}
                                    />
                                </svg>
                            </LikeButton>
                        </Row>
                    );
                })}
            </ListBox>
            )}

            <Modal
                type="confirm"
                isOpen={unlikeTargetId !== null}
                onClose={() => setUnlikeTargetId(null)}
                onConfirm={() => handleConfirmUnlike()}
                message="좋아요를 취소하겠습니까?"
                confirmText="네"
            />
            <Modal
                type="confirm"
                isOpen={isUnlikeFailedModalOpen}
                onClose={() => setIsUnlikeFailedModalOpen(false)}
                message={'좋아요 취소에 실패했어요.\n다시 시도해주세요'}
                cancelText="닫기"
            />
        </Wrapper>
    );
}

export default LikedIdeasBoard;

const Wrapper = styled.div`
    padding-top : 24px;
    display : flex;
    flex-direction : column;
    align-items : center;
`;

const Title = styled.h1`
    width : 695px;
    margin : 0;
    text-align : center;
    font-size : ${tokens.fontSize.page};
    font-weight : ${tokens.fontWeight.semibold};
`;

const ListBox = styled.div`
    width : 695px;
    margin-top : 64px;
    box-sizing : border-box;
    border : 1px solid #E5E5E5;
    border-radius : 12px;
    overflow : hidden;
`;

const Row = styled.div`
    width : 100%;
    height : 72px;
    box-sizing : border-box;
    padding : 0 24px;
    display : flex;
    align-items : center;
    gap : 40px;
    border : none;
    border-bottom : 1px solid #E5E5E5;
    background : #FFFFFF;
    cursor : pointer;
    text-align : left;

    &:last-child {
        border-bottom : none;
    }
`;

const AuthorGroup = styled.div<{ $clickable: boolean }>`
    flex-shrink : 0;
    display : flex;
    align-items : center;
    gap : 12px;
    cursor : ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

const Nickname = styled.div`
    max-width : 70px;
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
    overflow : hidden;
    text-overflow : ellipsis;
    white-space : nowrap;
`;

const IdeaInfo = styled.div`
    flex : 1;
    min-width : 0;
    display : flex;
    align-items : center;
    justify-content : center;
    gap : 4px;
`;

const IdeaTitle = styled.span`
    min-width : 0;
    font-size : 13px;
    font-weight : ${tokens.fontWeight.regular};
    overflow : hidden;
    text-overflow : ellipsis;
    white-space : nowrap;
`;

const IdeaMeta = styled.span`
    flex-shrink : 0;
    font-size : 13px;
    font-weight : ${tokens.fontWeight.regular};
    white-space : nowrap;
`;

const LikeButton = styled.button`
    flex-shrink : 0;
    width : 20px;
    height : 18px;
    border : none;
    background : none;
    padding : 0;
    cursor : pointer;
    display : flex;
    align-items : center;
    justify-content : center;

    &:active {
        opacity : 0.6;
    }
`;
