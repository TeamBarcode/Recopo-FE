import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import Header from '@/components/layout/Header';

function Layout() {
  return (
    <PageWrapper>
      <FixedHeaderArea>
        <Header />
      </FixedHeaderArea>

      <Main>
        <Content>
          <Outlet />
        </Content>
      </Main>
    </PageWrapper>
  );
}

export default Layout;

const HEADER_HEIGHT = '140px';

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
`;

const FixedHeaderArea = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: ${HEADER_HEIGHT};
  background-color: #ffffff;
`;

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  padding-top: ${HEADER_HEIGHT};
  padding-right: 80px;
  padding-left: 80px;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    padding-right: 48px;
    padding-left: 48px;
  }

  @media (max-width: 900px) {
    padding-right: 24px;
    padding-left: 24px;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
`;
