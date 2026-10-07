import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Avatar from '@/components/common/Avatar';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import CardColorModal from './CardColorModal';
import { tokens } from '@/styles/tokens';
import { fetchMockMyPageSummary, logoutMock, withdrawMockUser } from '@/mocks/mypage';
import type { MyPageSummary } from '@/mocks/mypage';

import profileEditIcon from '@/assets/profile_edit.svg';
import brainstormingIcon from '@/assets/mypage_brainstorming.svg';
import ideaIcon from '@/assets/mypage_idea.svg';
import emailIcon from '@/assets/mypage_email.svg';
import colorIcon from '@/assets/mypage_color.svg';
import likesIcon from '@/assets/mypage_likes.svg';

function MyPageBoard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<MyPageSummary | null>(null);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isCardColorModalOpen, setIsCardColorModalOpen] = useState(false);

    useEffect(() => {
        fetchMockMyPageSummary().then(setSummary);
    }, []);

    const handleConfirmWithdraw = async () => {
        await withdrawMockUser();
        setIsWithdrawModalOpen(false);
        navigate('/login');
    };

    const handleConfirmLogout = async () => {
        await logoutMock();
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    if (!summary) return <Loading minHeight="480px" />;

    return (
        <Wrapper>
            <ProfileBox>
                <ProfileLeft>
                    <AvatarWrapper>
                        <Avatar src={summary.profileImageUrl} size="lg" />
                        <EditButton type="button" onClick={() => navigate('/mypage/edit')} aria-label="프로필 수정">
                            <img src={profileEditIcon} alt="" />
                        </EditButton>
                    </AvatarWrapper>
                    <ProfileText>
                        <Nickname>{summary.nickname}</Nickname>
                        <UserIdText>@{summary.userId}</UserIdText>
                    </ProfileText>
                </ProfileLeft>

                <StatsBox>
                    <StatItem>
                        <img src={brainstormingIcon} alt="" />
                        <StatLabel>Brainstorming</StatLabel>
                        <StatValue>{summary.brainstormingCount}개</StatValue>
                    </StatItem>
                    <StatDivider />
                    <StatItem>
                        <img src={ideaIcon} alt="" />
                        <StatLabel>Idea</StatLabel>
                        <StatValue>{summary.ideaCount}개</StatValue>
                    </StatItem>
                </StatsBox>
            </ProfileBox>

            <AccountBox>
                <EmailBox>
                    <EmailTitle>Google 로그인 계정 이메일</EmailTitle>
                    <EmailRow>
                        <img src={emailIcon} alt="" />
                        <EmailText>{summary.email}</EmailText>
                    </EmailRow>
                </EmailBox>

                <AccountDivider />

                <AccountItem type="button" onClick={() => setIsCardColorModalOpen(true)}>
                    <img src={colorIcon} alt="" />
                    <AccountItemLabel>카드 색상 설정</AccountItemLabel>
                </AccountItem>

                <AccountDivider />

                <AccountItem type="button" onClick={() => navigate('/mypage/liked')}>
                    <img src={likesIcon} alt="" />
                    <AccountItemLabel>좋아요한 아이디어</AccountItemLabel>
                </AccountItem>
            </AccountBox>

            <LeaveBox>
                <LeaveButton type="button" onClick={() => setIsWithdrawModalOpen(true)}>
                    탈퇴하기
                </LeaveButton>
                <LeaveDivider />
                <LeaveButton type="button" onClick={() => setIsLogoutModalOpen(true)}>
                    로그아웃
                </LeaveButton>
            </LeaveBox>

            <Modal
                type="confirm"
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                onConfirm={handleConfirmWithdraw}
                message="정말로 떠나실건가요?"
                confirmText="탈퇴하기"
                cancelText="취소"
            />

            <Modal
                type="confirm"
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                message="로그아웃 하시겠습니까?"
                confirmText="네"
                cancelText="아니오"
            />

            <CardColorModal
                isOpen={isCardColorModalOpen}
                onClose={() => setIsCardColorModalOpen(false)}
            />
        </Wrapper>
    );
}

export default MyPageBoard;

const Wrapper = styled.div`
    padding-top : 24px;
    display : flex;
    flex-direction : column;
    align-items : center;
`;

const ProfileBox = styled.div`
    width : 662px;
    height : 130px;
    box-sizing : border-box;
    border : 1px solid #E5E5E5;
    border-radius : 12px;
    padding : 0 38px;
    display : flex;
    align-items : center;
    justify-content : space-between;
`;

const ProfileLeft = styled.div`
    display : flex;
    align-items : center;
    gap : 18px;
`;

const AvatarWrapper = styled.div`
    position : relative;
`;

const EditButton = styled.button`
    position : absolute;
    left : -4px;
    bottom : -4px;
    width : 30px;
    height : 30px;
    display : flex;
    align-items : center;
    justify-content : center;
    background : #FFFFFF;
    border : 1px solid #E5E5E5;
    border-radius : 50%;
    padding : 0;
    cursor : pointer;

    img {
        width : 18px;
        height : 18px;
    }
`;

const ProfileText = styled.div`
    display : flex;
    flex-direction : column;
    gap : 6px;
`;

const Nickname = styled.div`
    font-size : ${tokens.fontSize.xl};
    font-weight : ${tokens.fontWeight.medium};
`;

const UserIdText = styled.div`
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
    color : ${tokens.colors.text.extraLight};
`;

const StatsBox = styled.div`
    width : 283px;
    height : 94px;
    box-sizing : border-box;
    background : #F7F7F7;
    border-radius : 10px;
    display : flex;
    align-items : center;
    justify-content : center;
`;

const StatItem = styled.div`
    flex : 1;
    display : flex;
    flex-direction : column;
    align-items : center;
    gap : 6px;
`;

const StatDivider = styled.div`
    width : 1.39px;
    height : 19px;
    background : #C0C0C0;
`;

const StatLabel = styled.div`
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
`;

const StatValue = styled.div`
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
`;

const AccountBox = styled.div`
    width : 662px;
    height : 130px;
    box-sizing : border-box;
    border : 1px solid #E5E5E5;
    border-radius : 12px;
    margin-top : 27px;
    padding : 0 32px;
    display : flex;
    align-items : center;
    justify-content : space-between;
`;

const EmailBox = styled.div`
    width : 278px;
    height : 94px;
    box-sizing : border-box;
    background : #F7F7F7;
    border-radius : 10px;
    padding : 20px 18px;
    display : flex;
    flex-direction : column;
    gap : 12px;
`;

const EmailTitle = styled.div`
    font-size : 13px;
    font-weight : ${tokens.fontWeight.regular};
`;

const EmailRow = styled.div`
    display : flex;
    align-items : center;
    gap : 6px;
`;

const EmailText = styled.div`
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
`;

const AccountDivider = styled.div`
    width : 1px;
    height : 26px;
    background : #E5E5E5;
`;

const AccountItem = styled.button`
    background : none;
    border : none;
    padding : 0;
    cursor : pointer;
    display : flex;
    flex-direction : column;
    align-items : center;
    gap : 8px;
`;

const AccountItemLabel = styled.div`
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
`;

const LeaveBox = styled.div`
    width : 226px;
    height : 48px;
    box-sizing : border-box;
    border : 0.74px solid #E5E5E5;
    border-radius : 15px;
    margin-top : 100px;
    display : flex;
    align-items : center;
    justify-content : center;
    gap : 16px;
`;

const LeaveButton = styled.button`
    background : none;
    border : none;
    padding : 0;
    cursor : pointer;
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
    color : ${tokens.colors.text.primary};

    &:first-child {
        color : ${tokens.colors.text.error};
    }
`;

const LeaveDivider = styled.div`
    width : 1px;
    height : 12px;
    background : #E5E5E5;
`;
