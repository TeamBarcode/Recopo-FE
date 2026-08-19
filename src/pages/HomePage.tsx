import styled from 'styled-components';
import BrainstormBoard from '@/features/brainstorm/components/BrainstormBoard';
import RecoBotPanel from '@/features/recobot/components/RecoBotPanel';


function HomePage() {
  return (
    <HomeGrid>
      <BrainstormBoard />
      <RecoBotPanel />
    </HomeGrid>
  );
}

export default HomePage;

const HomeGrid = styled.div`
  display : grid;
  grid-template-columns : minmax(260px, 1fr) 350px;
  column-gap : 33px;
  margin-right : -68px;
  height : calc(100vh - 150px);
  overflow : hidden;

  @media (max-width : 1200px){
    margin-right : -36px;
  }

  @media (max-width : 900px){
    margin-right : -12px;
  }
`;
/*2-column grid 뼈대
HomeGrid (grid-template-columns: 1fr 350px)
├── 1번째 자식 → 1번 컬럼 (남는 공간 전부, 1fr)
└── 2번째 자식 → 2번 컬럼 (고정 350px, ai 패널 크기)
grid는 자식 요소가 들어오면 순서대로 컬럼에 자동 배치
— 그래서 <HomeGrid> 안에 <BrainstormBoard />, <RecoBotPanel /> 두 개만 넣으면, 
첫째가 1번 컬럼(넓은 쪽), 둘째가 2번 컬럼(350px)에 저절로 들어가는 거야. 컬럼 개수를 "2개"로 정의했기 때문에 자식도 정확히 2개일 때 딱 맞아떨어지는 구조.
column-gap: 25px; 두 컬럼 사이의 간격
*/
//align-items : stretch;둘 중 더 큰 쪽(BrainstormBoard) 높이에 맞춰, stretch가 짧은 쪽(RecoBotPanel)을 억지로 늘려줌
//height : calc(100vh-150px); 화면 전체 높이 - 헤더 높이
//여기서 150은 Layout.tsx의 HEADER_HEIGHT(헤더 높이)랑 똑같은 숫자
//overflow : hidden; 은 그냥 안전장치로..
/*
margin-right: -68px; Main의 오른쪽 패딩 80px → 12px로 좁히기
margin-right: -36px;  이 구간 Main 패딩이 48px이라 48-12
margin-right: -12px;  이 구간 Main 패딩이 24px이라 24-12
*/