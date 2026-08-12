import { useEffect, useState, type FormEvent } from 'react';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import {
    fetchMockFriends,
    searchMockUsers,
    sendMockFriendRequest,
    cancelMockFriendRequest,
    deleteMockFriend,
    fetchMockFriendsIdeas,
    fetchMockFriendIdeaDetail,
} from '@/mocks/friends';
import type { Friend, SearchedUser } from '@/mocks/friends';
import {
    createMockComment,
    deleteMockComment,
    createMockReply,
} from '@/mocks/ideaCards';
import type { IdeaCard as IdeaCardData, IdeaDetail, Comment } from '@/mocks/ideaCards';
import { mockUser } from '@/mocks/user';
import type { Category } from '@/components/common/Tag';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Dropdown from '@/components/common/Dropdown';
import Modal from '@/components/common/Modal';
import Tag from '@/components/common/Tag';
import IdeaCard from '@/features/idea/IdeaCard';
import heartIcon from '@/assets/idea-heart.svg';
import commentIcon from '@/assets/idea-comment.svg';
import searchIcon from '@/assets/search.svg';
import closeIcon from '@/assets/closeButton.svg';
import clipIcon from '@/assets/idea-clip.svg';
import sendArrowIcon from '@/assets/comment-send-arrow.svg';
import recobotHappy from '@/assets/recobot-happy.svg';

const CATEGORY_OPTIONS = [
    '콘텐츠/미디어', '생활', '건강', '업무/도구', '개발/디자인', '사람', '기타',
];

const SORT_OPTIONS = ['최신순', '오래된순', '좋아요순'];

function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState<SearchedUser[] | null>(null);

    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [friendIdeas, setFriendIdeas] = useState<IdeaCardData[]>([]);
    const [ideaCategory, setIdeaCategory] = useState('');
    const [ideaSort, setIdeaSort] = useState('');

    const [openIdea, setOpenIdea] = useState<IdeaDetail | null>(null);
    const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

    const [cancelTarget, setCancelTarget] = useState<SearchedUser | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Friend | null>(null);
    const [openFriendMenuId, setOpenFriendMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchMockFriends().then(setFriends);
    }, []);

    useEffect(() => {
        if (!selectedFriend) return;
        const sortBy = ideaSort === '최신순' ? 'latest' : ideaSort === '오래된순' ? 'oldest' : ideaSort === '좋아요순' ? 'popular' : undefined;
        fetchMockFriendsIdeas(selectedFriend.id, ideaCategory || undefined, sortBy).then(setFriendIdeas);
    }, [selectedFriend, ideaCategory, ideaSort]);

    const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchInput.trim();
        if (!query) return;
        const results = await searchMockUsers(query);
        setSearchResults(results);
    };

    const handleCloseSearch = () => {
        setSearchResults(null);
        setSearchInput('');
    };

    const handleSendRequest = async (targetUser: SearchedUser) => {
        await sendMockFriendRequest(targetUser.userId);
        setSearchResults((prev) =>
            prev
                ? prev.map((user) =>
                      user.id === targetUser.id ? { ...user, requestStatus: 'requested' } : user,
                  )
                : prev,
        );
    };

    const handleConfirmCancelRequest = async () => {
        if (!cancelTarget) return;
        await cancelMockFriendRequest(cancelTarget.userId);
        setSearchResults((prev) =>
            prev
                ? prev.map((user) =>
                      user.id === cancelTarget.id ? { ...user, requestStatus: 'none' } : user,
                  )
                : prev,
        );
        setCancelTarget(null);
    };

    const handleSelectFriend = (friend: Friend) => {
        setSelectedFriend(friend);
        setIdeaCategory('');
        setIdeaSort('');
    };

    const handleConfirmDeleteFriend = async () => {
        if (!deleteTarget) return;
        await deleteMockFriend(deleteTarget.id);
        setFriends((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        if (selectedFriend?.id === deleteTarget.id) {
            setSelectedFriend(null);
            setFriendIdeas([]);
        }
        setDeleteTarget(null);
    };

    const handleRequestDeleteFriend = (friend: Friend) => {
        setDeleteTarget(friend);
        setOpenFriendMenuId(null);
    };

    const handleOpenIdea = async (ideaId: string) => {
        const detail = await fetchMockFriendIdeaDetail(ideaId);
        setOpenIdea(detail);
    };

    const handleCloseIdeaModal = () => {
        setOpenIdea(null);
        setIsCommentDrawerOpen(false);
    };

    // 좋아요 토글 mock API가 따로 없어서 로컬 상태에서만 반영
    const handleToggleLike = () => {
        setOpenIdea((prev) => {
            if (!prev) return prev;
            const likedByMe = !prev.likedByMe;
            return { ...prev, likedByMe, likeCount: prev.likeCount + (likedByMe ? 1 : -1) };
        });
    };

    const recommendedRepo = openIdea?.recoBotResult[0];

    return (
        <Wrapper>
            <Sidebar>
                <SearchForm onSubmit={handleSearch} role="search">
                    <SearchInput
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="친구를 찾아보세요"
                        aria-label="친구 검색"
                    />
                    <SearchButton type="submit" aria-label="검색">
                        <img src={searchIcon} alt="" />
                    </SearchButton>
                </SearchForm>

                <ListPanel>
                    {searchResults ? (
                        <>
                            <PanelHeaderRow>
                                <PanelTitle>검색 결과</PanelTitle>
                                <CloseButton type="button" onClick={handleCloseSearch} aria-label="검색 결과 닫기">
                                    <img src={closeIcon} alt="" />
                                </CloseButton>
                            </PanelHeaderRow>
                            <Divider />
                            {searchResults.map((user) => (
                                <ResultRow key={user.id}>
                                    <Avatar size="sm" src={user.profileImageUrl} />
                                    <UserText>
                                        <UserNickname>{user.nickname}</UserNickname>
                                        <UserId>@{user.userId}</UserId>
                                    </UserText>
                                    {user.requestStatus === 'none' && (
                                        <Button variant="primary" size="sm" onClick={() => handleSendRequest(user)}>
                                            친구 추가
                                        </Button>
                                    )}
                                    {user.requestStatus === 'requested' && (
                                        <StatusButton type="button" onClick={() => setCancelTarget(user)}>
                                            요청됨
                                        </StatusButton>
                                    )}
                                    {user.requestStatus === 'friend' && <StatusLabel>친구</StatusLabel>}
                                </ResultRow>
                            ))}
                            {searchResults.length === 0 && <EmptyResultText>검색 결과가 없어요</EmptyResultText>}
                        </>
                    ) : (
                        <>
                            <PanelTitle>Friends({friends.length})</PanelTitle>
                            <Divider />
                            {friends.map((friend) => (
                                <FriendRow key={friend.id} $active={selectedFriend?.id === friend.id}>
                                    <FriendRowMain type="button" onClick={() => handleSelectFriend(friend)}>
                                        <Avatar size="sm" src={friend.profileImageUrl} />
                                        <UserNickname>{friend.nickname}</UserNickname>
                                    </FriendRowMain>
                                    <FriendMenuWrapper>
                                        <FriendMenuButton
                                            type="button"
                                            aria-label={`${friend.nickname} 메뉴`}
                                            onClick={() => setOpenFriendMenuId((prev) => (prev === friend.id ? null : friend.id))}
                                        >
                                            ···
                                        </FriendMenuButton>
                                        {openFriendMenuId === friend.id && (
                                            <FriendMenuPopup type="button" onClick={() => handleRequestDeleteFriend(friend)}>
                                                삭제
                                            </FriendMenuPopup>
                                        )}
                                    </FriendMenuWrapper>
                                </FriendRow>
                            ))}
                        </>
                    )}
                </ListPanel>
            </Sidebar>

            <MainArea>
                {selectedFriend ? (
                    <IdeaListArea>
                        <IdeaListHeader>
                            <IdeaListTitle>{selectedFriend.nickname}님의 아이디어</IdeaListTitle>
                            <FilterRow>
                                <Dropdown
                                    options={CATEGORY_OPTIONS}
                                    value={ideaCategory}
                                    onChange={setIdeaCategory}
                                    size="sm"
                                    placeholder="카테고리"
                                />
                                <Dropdown
                                    options={SORT_OPTIONS}
                                    value={ideaSort}
                                    onChange={setIdeaSort}
                                    size="sm"
                                    placeholder="정렬"
                                />
                            </FilterRow>
                        </IdeaListHeader>

                        {friendIdeas.length > 0 ? (
                            <IdeaGrid>
                                {friendIdeas.map((idea) => (
                                    <IdeaCard key={idea.id} idea={idea} onClick={() => handleOpenIdea(idea.id)} />
                                ))}
                            </IdeaGrid>
                        ) : (
                            <EmptyResultText>공개된 아이디어가 없어요</EmptyResultText>
                        )}
                    </IdeaListArea>
                ) : (
                    <PlaceholderWrapper>
                        <PlaceholderText>친구의 아이디어가 궁금하다면 사이드바에서 친구를 선택해보세요!</PlaceholderText>
                        <RobotIcon src={recobotHappy} alt="" />
                    </PlaceholderWrapper>
                )}
            </MainArea>

            <Modal type="default" size="lg" isOpen={!!openIdea} onClose={handleCloseIdeaModal}>
                {openIdea && (
                    <DetailWrapper>
                        <DetailScroll>
                            <DetailHeaderRow>
                                <DetailHeader>
                                    <DetailTitle>{openIdea.title}</DetailTitle>
                                    <DetailDate>{openIdea.createdAt}</DetailDate>
                                </DetailHeader>

                                <DetailMetaBox>
                                    <DetailMetaClip src={clipIcon} alt="" aria-hidden="true" />
                                    <DetailMetaRow>
                                        <DetailMetaLabel>카테고리</DetailMetaLabel>
                                        <DetailMetaTagList>
                                            <Tag variant="category" usage="idea" category={openIdea.category as Category}>{openIdea.category}</Tag>
                                        </DetailMetaTagList>
                                    </DetailMetaRow>
                                    <DetailMetaRow>
                                        <DetailMetaLabel>해시태그</DetailMetaLabel>
                                        <DetailMetaTagList>
                                            {openIdea.tags?.map((tag) => (
                                                <Tag key={tag} variant="hashtag" usage="idea">{tag}</Tag>
                                            ))}
                                        </DetailMetaTagList>
                                    </DetailMetaRow>
                                </DetailMetaBox>
                            </DetailHeaderRow>

                            <DetailContentBox>
                                <DetailSection>
                                    <DetailSectionTitle>아이디어 요약</DetailSectionTitle>
                                    <DetailSectionBody>{openIdea.brainstormContent || openIdea.summary}</DetailSectionBody>
                                </DetailSection>

                                {openIdea.techStack.length > 0 && (
                                    <DetailSection>
                                        <DetailSectionTitle>추천 기술 스택</DetailSectionTitle>
                                        <DetailTechList>
                                            {openIdea.techStack.map((tech) => (
                                                <li key={tech}>{tech}</li>
                                            ))}
                                        </DetailTechList>
                                    </DetailSection>
                                )}

                                {recommendedRepo && (
                                    <DetailSection>
                                        <DetailSectionTitle>추천 레포</DetailSectionTitle>
                                        <DetailRepoCard href={recommendedRepo.repoUrl} target="_blank" rel="noreferrer">
                                            <DetailRepoName>{recommendedRepo.repoName}</DetailRepoName>
                                            <DetailRepoDescription>{recommendedRepo.description}</DetailRepoDescription>
                                        </DetailRepoCard>
                                    </DetailSection>
                                )}
                            </DetailContentBox>

                            <DetailFooter>
                                <DetailFooterButton type="button" onClick={handleToggleLike} $active={openIdea.likedByMe}>
                                    <ReactionIcon src={heartIcon} alt="" />{openIdea.likeCount}개
                                </DetailFooterButton>
                                <DetailFooterButton type="button" onClick={() => setIsCommentDrawerOpen(true)}>
                                    <ReactionIcon src={commentIcon} alt="" />{openIdea.commentCount}개
                                </DetailFooterButton>
                            </DetailFooter>
                        </DetailScroll>

                        <CommentDrawer $open={isCommentDrawerOpen} role="dialog" aria-label="댓글">
                            <CommentDrawerHeader>
                                <CommentDrawerHandle aria-hidden="true" />
                                <CommentDrawerTitleRow>
                                    <CommentDrawerTitle>댓글 {openIdea.commentCount}개</CommentDrawerTitle>
                                    <CommentDrawerCloseButton type="button" onClick={() => setIsCommentDrawerOpen(false)} aria-label="댓글창 닫기">
                                        <img src={closeIcon} alt="" />
                                    </CommentDrawerCloseButton>
                                </CommentDrawerTitleRow>
                            </CommentDrawerHeader>
                            <FriendCommentSection
                                ideaId={openIdea.id}
                                comments={openIdea.comments}
                                onCommentsChange={(comments, countDelta) =>
                                    setOpenIdea((prev) =>
                                        prev ? { ...prev, comments, commentCount: prev.commentCount + countDelta } : prev,
                                    )
                                }
                            />
                        </CommentDrawer>
                    </DetailWrapper>
                )}
            </Modal>

            <Modal
                type="confirm"
                isOpen={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={handleConfirmCancelRequest}
                message={cancelTarget ? `${cancelTarget.nickname}(@${cancelTarget.userId})님에게 보낸 친구 요청을 취소하시겠어요?` : ''}
            />
            <Modal
                type="confirm"
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDeleteFriend}
                message={deleteTarget ? `${deleteTarget.nickname}님을 친구 목록에서 삭제할까요?` : ''}
            />
        </Wrapper>
    );
}

export default FriendsPage;

const Wrapper = styled.div`
    display: flex;
    gap: 24px;
`;

const Sidebar = styled.div`
    width: 234px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const SearchForm = styled.form`
    height: 35px;
    display: flex;
    align-items: center;
    border: 1px solid ${tokens.colors.border.search};
    border-radius: ${tokens.radius.xs};
    background: white;
`;

const SearchInput = styled.input`
    flex: 1;
    min-width: 0;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 0 12px;
    font-size: ${tokens.fontSize.md};

    &::placeholder {
        color: ${tokens.colors.text.placeholder};
    }
`;

const SearchButton = styled.button`
    flex-shrink: 0;
    width: 32px;
    height: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
        width: 16px;
        height: 16px;
    }
`;

const ListPanel = styled.div`
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: ${tokens.radius.sm};
    padding: 20px;
    min-height: 400px;
`;

const PanelHeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const PanelTitle = styled.div`
    font-size: ${tokens.fontSize.xl};
`;

const CloseButton = styled.button`
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;

    img {
        width: 18px;
        height: 18px;
    }
`;

const Divider = styled.div`
    height: 1px;
    background: ${tokens.colors.border.primary};
    margin: 8px 0 12px;
`;

const FriendRowMain = styled.button`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 18px;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    text-align: left;
`;

const FriendMenuWrapper = styled.div`
    position: relative;
    z-index: 1;
    flex-shrink: 0;
`;

const FriendMenuButton = styled.button`
    border: none;
    background: none;
    padding: 4px;
    font-size: ${tokens.fontSize.lg};
    letter-spacing: -1px;
    color: ${tokens.colors.text.extraLight};
    cursor: pointer;
`;

const FriendMenuPopup = styled.button`
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    margin-left: 6px;
    padding: 6px 14px;
    border: none;
    border-radius: 9999px;
    background: ${tokens.colors.button.light};
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);
    font-size: ${tokens.fontSize.sm};
    white-space: nowrap;
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;

const FriendRow = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
`;

const ResultRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
`;

const UserText = styled.div`
    flex: 1;
`;

const UserNickname = styled.div`
    font-size: ${tokens.fontSize.md};
`;

const UserId = styled.div`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const StatusLabel = styled.span`
    flex-shrink: 0;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
    background: ${tokens.colors.button.light};
    padding: 4px 10px;
    border-radius: 9999px;
`;

const StatusButton = styled.button`
    flex-shrink: 0;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
    background: ${tokens.colors.button.light};
    padding: 4px 10px;
    border-radius: 9999px;
    border: none;
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;

const EmptyResultText = styled.div`
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.extraLight};
    text-align: center;
    margin-top: 24px;
`;

const MainArea = styled.div`
    flex: 1;
    min-height: 400px;
`;

const PlaceholderWrapper = styled.div`
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: ${tokens.colors.text.primary};
    font-size: ${tokens.fontSize.xl};
`;

const PlaceholderText = styled.p``;

const RobotIcon = styled.img`
    width: 24px;
    height: 24px;
`;

const IdeaListArea = styled.div`
    max-width: 930px;
`;

const IdeaListHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const IdeaListTitle = styled.h2`
    font-size: ${tokens.fontSize.page};
    font-weight: ${tokens.fontWeight.regular};
`;

const FilterRow = styled.div`
    display: flex;
    gap: 8px;
`;

const IdeaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(220px, 270px));
    justify-content: start;
    gap: 40px 60px;

    @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(220px, 270px)); }
    @media (max-width: 560px) { grid-template-columns: minmax(220px, 270px); }
`;

const DetailWrapper = styled.div`
    position: relative;
    height: 432px;
    overflow: hidden;
`;

const DetailScroll = styled.div`
    height: 100%;
    overflow-y: auto;
    padding: 28px 20px 4px;
`;

const DetailHeaderRow = styled.div`
    position: relative;
`;

const DetailHeader = styled.div`
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding-right: 150px;
`;

const DetailTitle = styled.h2`
    font-size: ${tokens.fontSize.title};
    font-weight: ${tokens.fontWeight.regular};
`;

const DetailDate = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const DetailMetaBox = styled.div`
    position: absolute;
    top: -4px;
    right: 0;
    width: 168px;
    padding: 16px 14px 14px;
    background: ${tokens.colors.background};
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
`;

const DetailMetaClip = styled.img`
    position: absolute;
    top: -20px;
    left: 50%;
    width: 42px;
    height: 38px;
    transform: translateX(-50%);
`;

const DetailMetaRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    & + & {
        margin-top: 14px;
    }
`;

const DetailMetaLabel = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const DetailMetaTagList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const DetailContentBox = styled.div`
    margin-top: 22px;
    padding: 26px;
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: ${tokens.radius.sm};
`;

const DetailSection = styled.div`
    & + & {
        margin-top: 24px;
    }
`;

const DetailSectionTitle = styled.div`
    font-size: ${tokens.fontSize.lg};
    font-weight: ${tokens.fontWeight.semibold};
    margin-bottom: 8px;
`;

const DetailSectionBody = styled.p`
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.light};
    white-space: pre-wrap;
`;

const DetailTechList = styled.ul`
    padding-left: 18px;
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.light};
`;

const DetailRepoCard = styled.a`
    display: block;
    padding: 12px;
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
`;

const DetailRepoName = styled.div`
    font-size: ${tokens.fontSize.md};
    font-weight: ${tokens.fontWeight.medium};
`;

const DetailRepoDescription = styled.div`
    margin-top: 4px;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.light};
`;

const DetailFooter = styled.div`
    display: flex;
    gap: 20px;
    margin-top: 14px;
    font-size: ${tokens.fontSize.md};
`;

const DetailFooterButton = styled.button<{ $active?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: none;
    padding: 0;
    font-size: ${tokens.fontSize.md};
    color: ${({ $active }) => ($active ? '#ff5252' : tokens.colors.text.light)};
    cursor: pointer;
`;

const ReactionIcon = styled.img`
    width: 13px;
    height: 13px;
`;

// ===== 댓글 슬라이드업 영역 =====

interface FriendCommentSectionProps {
    ideaId: string;
    comments: Comment[];
    onCommentsChange: (comments: Comment[], countDelta: number) => void;
}

function FriendCommentSection({ ideaId, comments, onCommentsChange }: FriendCommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [openReplyCommentId, setOpenReplyCommentId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleSubmitComment = async () => {
        const content = newComment.trim();
        if (!content) return;

        const created = await createMockComment({ ideaId, content });
        onCommentsChange([...comments, created], 1);
        setNewComment('');
    };

    const handleDeleteComment = async (commentId: string) => {
        await deleteMockComment(commentId);
        onCommentsChange(comments.filter((comment) => comment.id !== commentId), -1);
        setOpenMenuId(null);
    };

    const handleSubmitReply = async (commentId: string) => {
        const content = replyInput.trim();
        if (!content) return;

        const created = await createMockReply({ commentId, content });
        onCommentsChange(
            comments.map((comment) =>
                comment.id === commentId
                    ? { ...comment, replies: [...comment.replies, created] }
                    : comment,
            ),
            1,
        );
        setReplyInput('');
        setOpenReplyCommentId(null);
    };

    // 답글 삭제 mock API가 따로 없어서 로컬 상태에서만 제거
    const handleDeleteReply = (commentId: string, replyId: string) => {
        onCommentsChange(
            comments.map((comment) =>
                comment.id === commentId
                    ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== replyId) }
                    : comment,
            ),
            -1,
        );
    };

    return (
        <>
            <CommentDrawerBody>
                {comments.length === 0 && <EmptyResultText>아직 댓글이 없어요</EmptyResultText>}
                {comments.map((comment) => (
                    <CommentItem key={comment.id}>
                        <Avatar size="xs" src={comment.authorProfileImageUrl} />
                        <CommentBody>
                            <CommentHeader>
                                <CommentAuthor>{comment.authorNickname}</CommentAuthor>
                                <CommentDate>{comment.createdAt}</CommentDate>
                            </CommentHeader>
                            <CommentContent>{comment.content}</CommentContent>
                            <CommentActions>
                                <Button
                                    variant="text"
                                    onClick={() =>
                                        setOpenReplyCommentId((prev) => (prev === comment.id ? null : comment.id))
                                    }
                                >
                                    답글달기
                                </Button>
                            </CommentActions>

                            {comment.replies.map((reply) => (
                                <ReplyItem key={reply.id}>
                                    <Avatar size="xs" src={reply.authorProfileImageUrl} />
                                    <CommentBody>
                                        <CommentHeader>
                                            <CommentAuthor>{reply.authorNickname}</CommentAuthor>
                                            <CommentDate>{reply.createdAt}</CommentDate>
                                        </CommentHeader>
                                        <CommentContent>{reply.content}</CommentContent>
                                        {reply.authorNickname === mockUser.nickname && (
                                            <CommentActions>
                                                <Button
                                                    variant="text"
                                                    onClick={() => handleDeleteReply(comment.id, reply.id)}
                                                >
                                                    삭제
                                                </Button>
                                            </CommentActions>
                                        )}
                                    </CommentBody>
                                </ReplyItem>
                            ))}

                            {openReplyCommentId === comment.id && (
                                <ReplyInputRow>
                                    <Avatar size="xs" src={mockUser.profileImageUrl} />
                                    <PillInput
                                        value={replyInput}
                                        onChange={(e) => setReplyInput(e.target.value)}
                                        placeholder="답글을 입력해주세요"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSubmitReply(comment.id);
                                            }
                                        }}
                                    />
                                    <SendButton type="button" aria-label="답글 등록" onClick={() => handleSubmitReply(comment.id)}>
                                        <img src={sendArrowIcon} alt="" />
                                    </SendButton>
                                </ReplyInputRow>
                            )}
                        </CommentBody>
                        {comment.authorNickname === mockUser.nickname && (
                            <CommentMenuWrapper>
                                <CommentMenuButton
                                    type="button"
                                    aria-label="댓글 메뉴"
                                    onClick={() => setOpenMenuId((prev) => (prev === comment.id ? null : comment.id))}
                                >
                                    ···
                                </CommentMenuButton>
                                {openMenuId === comment.id && (
                                    <CommentMenuPopup type="button" onClick={() => handleDeleteComment(comment.id)}>
                                        삭제
                                    </CommentMenuPopup>
                                )}
                            </CommentMenuWrapper>
                        )}
                    </CommentItem>
                ))}
            </CommentDrawerBody>

            <CommentDrawerInputRow>
                <Avatar size="xs" src={mockUser.profileImageUrl} />
                <PillInput
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="회원님의 생각을 남겨보세요"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmitComment();
                        }
                    }}
                />
                <SendButton type="button" aria-label="댓글 등록" onClick={handleSubmitComment}>
                    <img src={sendArrowIcon} alt="" />
                </SendButton>
            </CommentDrawerInputRow>
        </>
    );
}

const CommentDrawer = styled.div<{ $open: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: ${tokens.colors.background};
    border-top-left-radius: ${tokens.radius.lg};
    border-top-right-radius: ${tokens.radius.lg};
    box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(${({ $open }) => ($open ? '0%' : '100%')});
    transition: transform 0.3s ease;
`;

const CommentDrawerHeader = styled.div`
    flex-shrink: 0;
    padding: 10px 20px 12px;
    border-bottom: 1px solid ${tokens.colors.border.primary};
`;

const CommentDrawerHandle = styled.div`
    width: 36px;
    height: 4px;
    margin: 0 auto 10px;
    border-radius: 9999px;
    background: ${tokens.colors.border.secondary};
`;

const CommentDrawerTitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const CommentDrawerTitle = styled.span`
    font-size: ${tokens.fontSize.lg};
    font-weight: ${tokens.fontWeight.medium};
`;

const CommentDrawerCloseButton = styled.button`
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;

    img {
        width: 16px;
        height: 16px;
    }
`;

const CommentDrawerBody = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const CommentDrawerInputRow = styled.div`
    flex-shrink: 0;
    padding: 12px 20px;
    border-top: 1px solid ${tokens.colors.border.primary};
    display: flex;
    gap: 10px;
    align-items: center;
`;

const CommentItem = styled.div`
    position: relative;
    display: flex;
    gap: 10px;
`;

const CommentBody = styled.div`
    flex: 1;
`;

const CommentHeader = styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
`;

const CommentAuthor = styled.span`
    font-size: ${tokens.fontSize.md};
    font-weight: ${tokens.fontWeight.medium};
`;

const CommentDate = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const CommentContent = styled.p`
    margin-top: 4px;
    font-size: ${tokens.fontSize.md};
`;

const CommentActions = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 6px;
`;

const ReplyItem = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 12px;
    margin-left: 20px;
`;

const ReplyInputRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 10px;
    margin-left: 20px;
`;

const PillInput = styled.input`
    flex: 1;
    height: 38px;
    padding: 0 14px;
    border: 1px solid ${tokens.colors.border.secondary};
    border-radius: 9999px;
    background: transparent;
    font-size: ${tokens.fontSize.md};

    &::placeholder {
        color: ${tokens.colors.text.placeholder};
    }

    &:focus {
        outline: none;
    }
`;

const SendButton = styled.button`
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: ${tokens.colors.button.light};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
        width: 12px;
        height: 12px;
    }

    &:active {
        opacity: 0.6;
    }
`;

const CommentMenuWrapper = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const CommentMenuButton = styled.button`
    border: none;
    background: none;
    padding: 4px;
    font-size: ${tokens.fontSize.lg};
    letter-spacing: -1px;
    color: ${tokens.colors.text.extraLight};
    cursor: pointer;
`;

const CommentMenuPopup = styled.button`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    padding: 6px 14px;
    border: none;
    border-radius: 9999px;
    background: ${tokens.colors.button.light};
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);
    font-size: ${tokens.fontSize.sm};
    white-space: nowrap;
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;
