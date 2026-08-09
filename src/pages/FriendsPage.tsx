import { useEffect, useState, type FormEvent } from 'react';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import { fetchMockFriends, searchMockUsers, sendMockFriendRequest } from '@/mocks/friends';
import type { Friend, SearchedUser } from '@/mocks/friends';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import searchIcon from '@/assets/search.svg';
import closeIcon from '@/assets/closeButton.svg';
import recobotHappy from '@/assets/recobot-happy.svg';

function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState<SearchedUser[] | null>(null);

    useEffect(() => {
        fetchMockFriends().then(setFriends);
    }, []);

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
                                    {user.requestStatus === 'requested' && <StatusLabel>요청됨</StatusLabel>}
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
                                <FriendRow key={friend.id}>
                                    <Avatar size="xs" src={friend.profileImageUrl} />
                                    <UserNickname>{friend.nickname}</UserNickname>
                                </FriendRow>
                            ))}
                        </>
                    )}
                </ListPanel>
            </Sidebar>

            <MainArea>
                {/* TODO(2차): 사이드바에서 친구 선택 시 fetchMockFriendsIdeas로 해당 친구의 공개 아이디어 목록 표시 */}
                <PlaceholderText>친구의 아이디어가 궁금하다면 사이드바에서 친구를 선택해보세요!</PlaceholderText>
                <RobotIcon src={recobotHappy} alt="" />
            </MainArea>
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

const FriendRow = styled.div`
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

const EmptyResultText = styled.div`
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.extraLight};
    text-align: center;
    margin-top: 24px;
`;

const MainArea = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 400px;
    color: ${tokens.colors.text.primary};
    font-size: ${tokens.fontSize.xl};
`;

const PlaceholderText = styled.p``;

const RobotIcon = styled.img`
    width: 24px;
    height: 24px;
`;
