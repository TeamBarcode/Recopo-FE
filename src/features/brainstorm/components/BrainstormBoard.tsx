import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';

import {tokens} from '@/styles/tokens';
import Dropdown from '@/components/common/Dropdown';
import BrainstormCardPreview from './BrainstormCardPreview';
import searchIcon from '@/assets/search.svg';
import HomeEmpty from '@/assets/Home_empty.svg';

import type {BrainstormCard} from '@/mocks/brainstormCards';
import {fetchMockCards} from '@/mocks/brainstormCards';

function BrainstormBoard(){
    const [category, setCategory] = useState('');
    // 정렬 드롭다운은 처음엔 '정렬' 플레이스홀더로 보여주되, 실제 정렬은 최신순을 기본 적용함
    const [sort, setSort] = useState('최신 순');
    const [sortTouched, setSortTouched] = useState(false);
    const [search, setSearch] = useState('');

    const [cards, setCards] = useState<BrainstormCard[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        console.log('category 바뀜:', category);
        // 드롭다운 옵션 자체가 한글 라벨('최신 순'/'오래된 순')이라, fetchMockCards가 기대하는
        // 영문 값('latest'/'oldest')으로 변환해서 넘겨야 실제로 정렬이 적용됨
        const sortBy = sort === '최신 순' ? 'latest' : sort === '오래된 순' ? 'oldest' : undefined;
        fetchMockCards(category, sortBy, search).then(setCards);
        //categort, sort, search 중 하나라도 바뀌면 다시 불러옴
    }, [category, sort, search]);


    return(
        <BoardWrapper>
            <Toolbar>
                <Subtitle>Brainstorming</Subtitle>
                <FilterGroup>
                    <DropdownGroup>
                        <Dropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} size="sm" placeholder="카테고리"/>
                        <Dropdown
                            options={SORT_OPTIONS}
                            value={sortTouched ? sort : ''}
                            onChange={(value) => {
                                setSort(value);
                                setSortTouched(true);
                            }}
                            size="sm"
                            placeholder="정렬"
                        />
                    </DropdownGroup>
                    <SearchBarWrapper>
                        <SearchInput value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="검색" />
                        <SearchButton type="button" aria-label="검색">
                            <img src={searchIcon} alt="" />
                        </SearchButton>
                    </SearchBarWrapper>
                </FilterGroup>
            </Toolbar>
            <CardScrollArea>
                {cards.length === 0 ? (
                    <EmptyState>
                        <img src={HomeEmpty} alt="첫 번째 아이디어를 작성해보세요" />
                    </EmptyState>
                ) : (
                    <CardGrid>
                        {cards.map((c) => (
                            <BrainstormCardPreview key={c.id} card={c}
                            />
                        ))}
                    </CardGrid>
                )}
            </CardScrollArea>
            <FabWrapper onClick={() => navigate('/record')}>+</FabWrapper>
        </BoardWrapper>
    );
}

export default BrainstormBoard;

const BoardWrapper = styled.div`
    position : relative;
    height : 100%;
    display : flex;
    flex-direction : column;
    overflow : hidden;

    @media (max-width : 900px) {
        height : auto;
        min-height : 400px;
        overflow : visible;
    }
`;
/* 
position relative fabwrapper의 기준점이 되게 함.
flex-direction column은 툴바랑 카드 영역이 세로로 배치되게 함.
*/

const Toolbar = styled.div`
    display : flex;
    align-items : center;
    justify-content : space-between;
    flex-shrink : 0;
    gap : 20px;
    margin-bottom : 50px;

    @media (max-width : 900px) {
        flex-wrap : wrap;
    }
`;
/*
display : flex 가로로 부제목, 필터 배치
align-items : center 부제목이랑 필터 등등ㅇ의 높이가 다를 수 있으므로 툴바 높이 내에서 세로 중앙에 맞춰 정렬됨<div className=""></div>
justify-content : space-between 부제목은 맨 왼쪽 끝, 마지막 자식인 필터그룹은 맨 오른쪽 끝으로
flex-shrink : 0 카드 영역이 커지려고 해도 툴바 크기 유지
*/

const Subtitle = styled.h2`
    font-family : ${tokens.fontFamily.logo};
    font-size : 21px;
    font-weight : ${tokens.fontWeight.regular};
`;

const FilterGroup = styled.div`
    display : flex;
    align-items : center;
    flex-wrap : wrap;
    gap : 38px 20px;
`;
// 드롭다운 묶음 전체와 검색창 사이의 간격 의미

const DropdownGroup = styled.div`
    display : flex;
    align-items : center;
    gap : 14px;
`;

const SearchBarWrapper = styled.div`
    width : 100%;
    max-width : 268px;
    height : 42px;
    box-sizing : border-box;
    display : flex;
    align-items : center;
    border : 1px solid #E4E4E4;
    border-radius : 10px;
    background : white;

    &:focus-within {
        border-color: #979797;
    }
`;
//outline: none으로 브라우저 기본 파란 링을 없애고, 원래 있던 border의 색만 focus 시 #979797로 바뀌게 하는 방식

const SearchInput = styled.input`
    flex : 1;
    min-width : 0;
    height : 100%;
    box-sizing : border-box;
    padding : 0 12px;
    border : 0;
    outline : 0;
    background : transparent;
    font-size : ${tokens.fontSize.lg};

    &::placeholder {
        color : ${tokens.colors.text.placeholder};
        font-weight : ${tokens.fontWeight.light};
    }
`;

const SearchButton = styled.button`
    flex-shrink : 0;
    width : 32px;
    height : 100%;
    padding : 0;
    display : flex;
    align-items : center;
    justify-content : center;
    border : 0;
    background : transparent;
    cursor : pointer;

    img {
        width : 16px;
        height : 16px;
    }
`;

const CardScrollArea = styled.div`
    flex : 1;
    overflow-y : auto;
    padding-top : 24px; 
`;
/* 
flex : 1; Toolbar 뺀 나머지 공간 전부 차지 (카드 개수와 무관하게 박스 크기 고정)
overflow-y : auto; 카드가 이 박스보다 많아지면 이 안에서만 스크롤바 생김
*/

const FabWrapper = styled.div`
    position : absolute;
    right : 0px;
    bottom : 24px;
    width : 48px;
    height : 48px;
    border-radius : 50%;
    background : #f5f5f5;
    border : 1px solid #e2e2e2;
    box-shadow : 0 1px 1px rgba(0, 0, 0, 0.25);
    display : flex;
    align-items : center;
    justify-content : center;
    font-size : 34px;
    font-weight : ${tokens.fontWeight.light};
    font-family : ${tokens.fontFamily.primary};
    color : #434343;
`;

const CATEGORY_OPTIONS = [
  '콘텐츠/미디어',
  '생활',
  '건강',
  '업무/도구',
  '개발/디자인',
  '사람',
  '기타',
];

const SORT_OPTIONS = ['최신 순', '오래된 순'];

const EmptyState = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-20px);
`;
//translateY로 위로 좀 올림.

const CardGrid = styled.div`
    display : grid;
    grid-template-columns : repeat(3, 1fr);
    column-gap : 62px;
    row-gap : 40px;
`;