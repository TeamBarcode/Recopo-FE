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

const HEADER_HEIGHT = '120px';

const HEADER_GAP = '10px';

const PageWrapper = styled.div`
  height: 100vh;
  overflow: hidden;
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
  height: calc(100vh - ${HEADER_HEIGHT} - ${HEADER_GAP});
  margin-top: calc(${HEADER_HEIGHT} + ${HEADER_GAP});
  overflow-y: auto;
  scrollbar-gutter: stable;
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
