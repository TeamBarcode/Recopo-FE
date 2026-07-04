import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import Header from '@/components/layout/Header';

function Layout() {
  return (
    <>
      <Header />
      <Main>
        <Outlet />
      </Main>
    </>
  );
}

export default Layout;

const Main = styled.main`
  width: 100%;
`;
