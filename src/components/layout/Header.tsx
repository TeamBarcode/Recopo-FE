import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import notificationIcon from '@/assets/notification.svg';
import Avatar from '@/components/common/Avatar';
import IconButton from '@/components/common/IconButton';
import { tokens } from '@/styles/tokens';
import { mockUser } from '@/mocks/user';
import NotificationPanel from './NotificationPanel';
import { useEffect, useRef, useState } from 'react';
import { hasUnreadNotification } from '@/mocks/notifications';

function Header() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(hasUnreadNotification());
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNotificationOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationOpen]);

  return (
    <HeaderContainer>
      <LogoLink to="/">
        <LogoTitle>Recopo.</LogoTitle>
        <LogoSubtitle>design your idea</LogoSubtitle>
      </LogoLink>

      <NavArea aria-label="주요 메뉴">
        <NavButton to="/" end>
          {({ isActive }) => (
            <IconWrapper>
              <HomeIcon color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR} />
              <NavLabel $top={35}>Home</NavLabel>
            </IconWrapper>
          )}
        </NavButton>

        <NavButton to="/ideas">
          {({ isActive }) => (
            <IconWrapper>
              <CloudIcon color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR} />
              <NavLabel $top={undefined}>Idea</NavLabel>
            </IconWrapper>
          )}
        </NavButton>

        <NavButton to="/friends">
          {({ isActive }) => (
            <IconWrapper>
              <StarIcon color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR} />
              <NavLabel $top={undefined}>Friends</NavLabel>
            </IconWrapper>
          )}
        </NavButton>
      </NavArea>

      <RightArea>
        <NotificationWrapper ref={notificationRef}>
          <IconButton
            size="lg"
            ariaLabel="알림"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            icon={<NotificationIcon src={notificationIcon} alt="" />}
          />
          {hasUnread && <NotificationDot />}
          {isNotificationOpen && (
            <NotificationPanel onUnreadChange={setHasUnread} />
          )}
        </NotificationWrapper>

        <ProfileLink to="/mypage" aria-label="마이페이지">
          {({ isActive }) =>
            isActive ? (
              <MyPageActiveIcon>MY</MyPageActiveIcon>
            ) : (
              <Avatar src={mockUser.profileImageUrl} size="md" alt="프로필 이미지" />
            )
          }
        </ProfileLink>
      </RightArea>
    </HeaderContainer>
  );
}

export default Header;

const ACTIVE_COLOR = '#C8C8C8';
const INACTIVE_COLOR = '#EEEEEE';

interface IconProps {
  color: string;
}

function HomeIcon({ color }: IconProps) {
  return (
    <svg
      width="107"
      height="43"
      viewBox="0 0 107 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 24H83V40.9952C83 42.1024 82.1024 43 80.9952 43H26.0048C24.8976 43 24 42.1024 24 40.9952V24Z"
        fill={color}
      />
      <path
        d="M52.5663 0.491433C53.1508 0.183813 53.8492 0.183814 54.4337 0.491434L92.6524 20.6065C94.5046 21.5813 93.8117 24.3854 91.7187 24.3854H15.2813C13.1883 24.3854 12.4955 21.5813 14.3476 20.6065L52.5663 0.491433Z"
        fill={color}
      />
    </svg>
  );
}

function CloudIcon({ color }: IconProps) {
  return (
    <svg width="65" height="44" viewBox="0 0 65 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="21.6644" cy="9.28465" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="37.1392" cy="24.7595" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="26.3069" cy="21.6648" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="54.1609" cy="24.7595" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="43.3287" cy="34.0437" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="26.3069" cy="34.0437" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="51.065" cy="15.4741" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="37.1392" cy="9.28465" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="10.8321" cy="30.949" rx="10.8321" ry="9.28465" fill={color} />
      <ellipse cx="10.8321" cy="18.5691" rx="10.8321" ry="9.28465" fill={color} />
    </svg>
  );
}

function StarIcon({ color }: IconProps) {
  return (
    <svg
      width="103"
      height="54"
      viewBox="0 0 103 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M52.3975 0L64.7669 20.7838H104.795L70.8487 37.9186L84.781 54.4128L52.3975 41.5677L20.0141 54.4128L32.4293 37.9186L0 20.7838H40.0281L52.3975 0Z"
        fill={color}
        fillOpacity="0.933333"
      />
    </svg>
  );
}

const HeaderContainer = styled.header`
  width: 100%;
  height: 120px;
  padding: 0 80px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    padding: 0 48px;
  }

  @media (max-width: 900px) {
    padding: 0 24px;
  }
`;

const LogoLink = styled(NavLink)`
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  color: #000000;
  text-decoration: none;

  @media (max-width: 1200px) {
    width: 200px;
  }

  @media (max-width: 900px) {
    width: 160px;
  }
`;

const LogoTitle = styled.span`
  font-family: ${tokens.fontFamily.logo};
  font-size: ${tokens.fontSize.logo};
  font-weight: ${tokens.fontWeight.bold};
  line-height: 0.9;
  letter-spacing: -1.4px;
  white-space: nowrap;

  @media (max-width: 900px) {
    font-size: 30px;
  }
`;

const LogoSubtitle = styled.span`
  margin-top: 4px;
  font-family: ${tokens.fontFamily.logo};
  font-size: ${tokens.fontSize.xl};
  font-weight: ${tokens.fontWeight.bold};
  line-height: 1;
  letter-spacing: -0.7px;
  white-space: nowrap;

  @media (max-width: 900px) {
    font-size: 14px;
  }
`;

const NavArea = styled.nav`
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
`;

const NavButton = styled(NavLink)`
  width: 112px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  color: #111111;
  text-decoration: none;

  @media (max-width: 900px) {
    width: 84px;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  width: 112px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    width: 84px;

    svg {
      transform: scale(0.82);
    }
  }
`;

const NavLabel = styled.span<{ $top?: number }>`
  position: absolute;
  left : 50%;
  top: ${({ $top }) => ($top !== undefined ? `${$top}px` : '50%')};
  transform: ${({ $top }) => ($top !== undefined ? 'translateX(-50%)' : 'translate(-50%, -50%)')};
  z-index: 1;
  color: #111111;
  font-size: 15px;
  font-weight: 400;

  @media (max-width: 900px) {
    font-size: 13px;
  }
`;
/* 
<NavLabel $top={35}>Home</NavLabel>  Home만 별도 지정
$top prop을 안 주면(Idea, Friends) → top: 50% + transform: translate(-50%, -50%)로 IconWrapper(112×80) 박스 정중앙에 고정
$top prop을 주면(Home만) → 그 값을 텍스트 윗변 위치로 직접 쓰고, 가로만 translateX(-50%)로 중앙 정렬
*/

const RightArea = styled.div`
  width: 240px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 38px;

  @media (max-width: 1200px) {
    width: 200px;
    gap: 28px;
  }

  @media (max-width: 900px) {
    width: 160px;
    gap: 18px;
  }
`;

const NotificationWrapper = styled.div`
  position: relative;
  width: 25px;
  height: 25px;
  flex-shrink: 0;
`;

const NotificationIcon = styled.img`
  width: 25px;
  height: 25px;
  display: block;
`;

const NotificationDot = styled.span`
  position: absolute;
  top: 1px;
  right: 1px;
  width: 7px;
  height: 7px;
  background-color: #e05243;
  border-radius: 50%;
  pointer-events: none;
`;

const ProfileLink = styled(NavLink)`
  width: 65px;
  height: 65px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  @media (max-width: 900px) {
    transform: scale(0.82);
  }
`;

const MyPageActiveIcon = styled.div`
  width: 65px;
  height: 65px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${ACTIVE_COLOR};
  color: #111111;
  font-size: 18px;
  font-weight: 900;
`;
