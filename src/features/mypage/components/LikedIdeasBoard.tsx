import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Avatar from '@/components/common/Avatar';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import { tokens } from '@/styles/tokens';
import { fetchMockLikedIdeas, unlikeMockIdea } from '@/mocks/mypage';
import { fetchMockFriends } from '@/mocks/friends';
import type { IdeaCard } from '@/mocks/ideaCards';
import type { Friend } from '@/mocks/friends';

function LikedIdeasBoard() {
    const navigate = useNavigate();
    const [likedIdeas, setLikedIdeas] = useState<IdeaCard[]>([]);
    const [friendsById, setFriendsById] = useState<Record<string, Friend>>({});
    const [unlikeTargetId, setUnlikeTargetId] = useState<string | null>(null);
    const [isUnlikeFailedModalOpen, setIsUnlikeFailedModalOpen] = useState(false);
    const isUnlikingRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchMockLikedIdeas().then(setLikedIdeas),
            fetchMockFriends().then((friends) => {
                const map: Record<string, Friend> = {};
                friends.forEach((friend) => {
                    map[friend.id] = friend;
                });
                setFriendsById(map);
            }),
        ]).then(() => setIsLoading(false));
    }, []);

    const handleConfirmUnlike = async () => {
        const ideaId = unlikeTargetId;
        if (!ideaId || isUnlikingRef.current) return;
        isUnlikingRef.current = true;

        setUnlikeTargetId(null);
        try {
            await unlikeMockIdea(ideaId);
            setLikedIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
        } catch {
            setIsUnlikeFailedModalOpen(true);
        } finally {
            isUnlikingRef.current = false;
        }
    };

    return (
        <Wrapper>
            <Title>좋아요한 아이디어</Title>

            {isLoading ? (
                <Loading minHeight="480px" />
            ) : (
            <ListBox>
                {likedIdeas.map((idea) => {
                    const author = friendsById[idea.authorId];

                    const handleOpenIdea = () => {
                        navigate(`/friends?friendId=${idea.authorId}&ideaId=${idea.id}`);
                    };

                    return (
                        <Row
                            key={idea.id}
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
                                    navigate(`/friends?friendId=${idea.authorId}`);
                                }}
                            >
                                <Avatar src={author?.profileImageUrl} size="sm" />
                                <Nickname>{author?.nickname ?? '닉네임'}</Nickname>
                            </AuthorGroup>

                            <IdeaInfo>
                                <IdeaTitle>{idea.title}</IdeaTitle>
                                <IdeaMeta>· {idea.category} · {idea.createdAt}</IdeaMeta>
                            </IdeaInfo>

                            <LikeButton
                                type="button"
                                aria-label="좋아요 취소"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUnlikeTargetId(idea.id);
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
