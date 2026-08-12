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
import type { IdeaCard, IdeaDetail } from '@/mocks/ideaCards';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Dropdown from '@/components/common/Dropdown';
import Modal from '@/components/common/Modal';
import Tag from '@/components/common/Tag';
import searchIcon from '@/assets/search.svg';
import closeIcon from '@/assets/closeButton.svg';
import recobotHappy from '@/assets/recobot-happy.svg';

const CATEGORY_OPTIONS = [
    '콘텐츠/미디어', '생활', '건강', '업무/도구', '개발/디자인', '사람', '기타',
];

const SORT_OPTIONS = ['최신순', '오래된순'];

function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState<SearchedUser[] | null>(null);

    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [friendIdeas, setFriendIdeas] = useState<IdeaCard[]>([]);
    const [ideaCategory, setIdeaCategory] = useState('');
    const [ideaSort, setIdeaSort] = useState('');

    const [openIdea, setOpenIdea] = useState<IdeaDetail | null>(null);

    const [cancelTarget, setCancelTarget] = useState<SearchedUser | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Friend | null>(null);

    useEffect(() => {
        fetchMockFriends().then(setFriends);
    }, []);

    useEffect(() => {
        if (!selectedFriend) return;
        const sortBy = ideaSort === '최신순' ? 'latest' : ideaSort === '오래된순' ? 'oldest' : undefined;
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

    const handleOpenIdea = async (ideaId: string) => {
        const detail = await fetchMockFriendIdeaDetail(ideaId);
        setOpenIdea(detail);
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
                                    <Avatar size="xs" src={user.profileImageUrl} />
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
                                        <Avatar size="xs" src={friend.profileImageUrl} />
                                        <UserNickname>{friend.nickname}</UserNickname>
                                    </FriendRowMain>
                                    <DeleteFriendButton type="button" onClick={() => setDeleteTarget(friend)}>
                                        삭제
                                    </DeleteFriendButton>
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
                                    <IdeaCardEl key={idea.id} type="button" onClick={() => handleOpenIdea(idea.id)}>
                                        <IdeaCardTitle>{idea.title}</IdeaCardTitle>
                                        <IdeaCardTagRow>
                                            {idea.tags?.map((tag) => (
                                                <Tag key={tag} variant="hashtag" usage="idea">{tag}</Tag>
                                            ))}
                                            <Tag variant="hashtag" usage="idea">{idea.category}</Tag>
                                        </IdeaCardTagRow>
                                        <IdeaCardSummary>{idea.summary}</IdeaCardSummary>
                                        <IdeaCardFooter>
                                            <span>{idea.createdAt}</span>
                                            <span>♡ {idea.likeCount}개 💬 {idea.commentCount}개</span>
                                        </IdeaCardFooter>
                                    </IdeaCardEl>
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

            <Modal type="default" size="lg" isOpen={!!openIdea} onClose={() => setOpenIdea(null)}>
                {openIdea && (
                    <IdeaDetailContent>
                        <IdeaDetailHeader>
                            <IdeaDetailTitle>{openIdea.title}</IdeaDetailTitle>
                            <IdeaDetailDate>{openIdea.createdAt}</IdeaDetailDate>
                        </IdeaDetailHeader>
                        <TagRow>
                            <Tag variant="hashtag" usage="idea">{openIdea.category}</Tag>
                            {openIdea.tags?.map((tag) => (
                                <Tag key={tag} variant="hashtag" usage="idea">{tag}</Tag>
                            ))}
                        </TagRow>

                        <DetailSection>
                            <DetailSectionTitle>아이디어 요약</DetailSectionTitle>
                            <DetailSectionBody>{openIdea.summary}</DetailSectionBody>
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

                        <DetailFooter>
                            ♡ {openIdea.likeCount}개 💬 {openIdea.commentCount}개
                        </DetailFooter>
                    </IdeaDetailContent>
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
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: ${tokens.radius.xs};
    background: ${tokens.colors.background};
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
    padding: 16px;
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
    gap: 10px;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    text-align: left;
`;

const DeleteFriendButton = styled.button`
    flex-shrink: 0;
    border: none;
    background: transparent;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
    padding: 4px 6px;

    &:hover {
        color: #ff3f3f;
    }
`;

const FriendRow = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-radius: ${tokens.radius.xs};
    background: ${({ $active }) => ($active ? tokens.colors.button.light : 'transparent')};

    &:hover ${DeleteFriendButton} {
        opacity: 1;
    }
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

const IdeaListArea = styled.div``;

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
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
`;

const IdeaCardEl = styled.button`
    text-align: left;
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: ${tokens.radius.sm};
    padding: 16px;
    background: ${tokens.colors.background};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &:active {
        opacity: 0.7;
    }
`;

const IdeaCardTitle = styled.div`
    font-size: ${tokens.fontSize.lg};
    font-weight: ${tokens.fontWeight.medium};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const IdeaCardTagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const IdeaCardSummary = styled.div`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.light};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const IdeaCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
    margin-top: auto;
`;

const IdeaDetailContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const IdeaDetailHeader = styled.div`
    display: flex;
    align-items: baseline;
    gap: 12px;
`;

const IdeaDetailTitle = styled.h2`
    font-size: ${tokens.fontSize.title};
    font-weight: ${tokens.fontWeight.regular};
`;

const IdeaDetailDate = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const DetailSection = styled.div``;

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
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.light};
`;
