import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

function Header() {
  return (
    <HeaderContainer>
      <LogoArea to="/">
        <LogoTitle>Recopo.</LogoTitle>
        <LogoSubtitle>design your idea</LogoSubtitle>
      </LogoArea>

      <NavArea>
        <NavItem to="/">
          <HomeShape />
          <NavText>Home</NavText>
        </NavItem>

        <NavItem to="/ideas">
          <CloudShape />
          <NavText>Idea</NavText>
        </NavItem>

        <NavItem to="/friends">
          <StarShape>★</StarShape>
          <NavText>Friends</NavText>
        </NavItem>
      </NavArea>

      <RightArea>
        <NotificationButton type="button" aria-label="알림">
          🔔
        </NotificationButton>
        <ProfileButton type="button" aria-label="프로필">
          <ProfilePlaceholder />
        </ProfileButton>
      </RightArea>
    </HeaderContainer>
  );
}

export default Header;

const HeaderContainer = styled.header`
  width: 100%;
  height: 96px;
  padding: 0 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  box-sizing: border-box;
`;

const LogoArea = styled(NavLink)`
  text-decoration: none;
  color: #000000;
  display: flex;
  flex-direction: column;
  line-height: 1;
`;

const LogoTitle = styled.span`
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
`;

const LogoSubtitle = styled.span`
  margin-top: 4px;
  font-size: 18px;
  font-weight: 700;
`;

const NavArea = styled.nav`
  display: flex;
  align-items: center;
  gap: 120px;
`;

const NavItem = styled(NavLink)`
  position: relative;
  width: 96px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111111;
  text-decoration: none;
  font-size: 15px;

  &.active {
    font-weight: 700;
  }
`;

const NavText = styled.span`
  position: relative;
  z-index: 1;
`;

const HomeShape = styled.span`
  position: absolute;
  width: 68px;
  height: 46px;
  background-color: #cfcfcf;
  border-radius: 3px;
  bottom: 7px;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: -25px;
    width: 54px;
    height: 54px;
    background-color: #cfcfcf;
    transform: translateX(-50%) rotate(45deg);
    border-radius: 3px;
  }
`;

const CloudShape = styled.span`
  position: absolute;
  width: 72px;
  height: 42px;
  background-color: #e9e9e9;
  border-radius: 24px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background-color: #e9e9e9;
    border-radius: 50%;
  }

  &::before {
    width: 34px;
    height: 34px;
    left: 10px;
    top: -12px;
  }

  &::after {
    width: 38px;
    height: 38px;
    right: 10px;
    top: -14px;
  }
`;

const StarShape = styled.span`
  position: absolute;
  color: #eeeeee;
  font-size: 104px;
  line-height: 1;
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const NotificationButton = styled.button`
  border: 0;
  background: none;
  padding: 0;
  font-size: 28px;
  cursor: pointer;
`;

const ProfileButton = styled.button`
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
`;

const ProfilePlaceholder = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff, #4f8fdc);
  border: 3px solid #4f8fdc;
`;
