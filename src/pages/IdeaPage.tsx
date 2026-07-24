import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Dropdown from '@/components/common/Dropdown';
import IdeaCard from '@/features/idea/IdeaCard';
import { categoryOptions, mockIdeas, sortOptions, visibilityOptions } from '@/features/idea/ideaData';
import { tokens } from '@/styles/tokens';

function IdeaPage() {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState('전체');
  const [category, setCategory] = useState('전체');
  const [sort, setSort] = useState('최신순');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIdeas = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase().replace(/^#/, '');
    return mockIdeas
      .filter((idea) => visibility === '전체' || idea.visibility === visibility)
      .filter((idea) => category === '전체' || idea.category === category)
      .filter((idea) => !keyword || idea.title.toLowerCase().includes(keyword) || idea.tags.some((tag) => tag.toLowerCase().includes(keyword)))
      .toSorted((first, second) => {
        if (sort === '좋아요순') return second.likeCount - first.likeCount;
        const firstDate = new Date(first.createdAt.replaceAll('.', '-')).getTime();
        const secondDate = new Date(second.createdAt.replaceAll('.', '-')).getTime();
        return sort === '오래된순' ? firstDate - secondDate : secondDate - firstDate;
      });
  }, [category, searchTerm, sort, visibility]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const searchEmpty = searchTerm.length > 0 && filteredIdeas.length === 0;

  return (
    <Page>
      <PageTitle>Idea</PageTitle>
      <Toolbar>
        <Filters>
          <Dropdown options={visibilityOptions} value={visibility} onChange={(value) => setVisibility(value || '전체')} size="sm" placeholder="전체" />
          <Dropdown options={categoryOptions} value={category === '전체' ? '' : category} onChange={(value) => setCategory(value || '전체')} size="sm" placeholder="카테고리" />
          <Dropdown options={sortOptions} value={sort === '최신순' ? '' : sort} onChange={(value) => setSort(value || '최신순')} size="sm" placeholder="정렬" />
        </Filters>
        <SearchForm onSubmit={handleSearch} role="search">
          <SearchInput value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="제목 또는 해시태그 검색" aria-label="아이디어 검색" />
          <SearchButton type="submit" aria-label="검색"><SearchIcon aria-hidden="true" /></SearchButton>
        </SearchForm>
      </Toolbar>

      {filteredIdeas.length > 0 ? (
        <IdeaGrid>
          {filteredIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} onClick={() => navigate(`/ideas/${idea.id}`)} />)}
        </IdeaGrid>
      ) : (
        <EmptyArea>
          <EmptyCard>
            <EmptyClip aria-hidden="true" />
            <EmptyTitle>{searchEmpty ? '검색 결과 없음' : '아이디어가 없어요!'}</EmptyTitle>
            {!searchEmpty && <EmptyDescription><strong>Recobot</strong>과 함께 브레인스토밍 카드를<br />아이디어로 만들어 보세요</EmptyDescription>}
          </EmptyCard>
          {searchEmpty && <SearchEmptyDescription>해당 검색어와 일치하는 제목 또는 태그가 없습니다</SearchEmptyDescription>}
        </EmptyArea>
      )}
    </Page>
  );
}

export default IdeaPage;

const Page = styled.section`width:100%; padding:4px 28px 80px;`;
const PageTitle = styled.h1`margin:0; font-family:${tokens.fontFamily.logo}; font-size:${tokens.fontSize.page}; font-weight:400;`;
const Toolbar = styled.div`margin-top:14px; display:flex; align-items:flex-start; justify-content:flex-end; gap:37px;`;
const Filters = styled.div`
  position:relative; z-index:10; display:flex; align-items:flex-start; gap:12px;
  > div:nth-child(1) { width:70px; } > div:nth-child(2) { width:90px; } > div:nth-child(3) { width:70px; }
  button { width:100%; white-space:nowrap; } > div > div { z-index:20; }
`;
const SearchForm = styled.form`width:268px; height:42px; display:flex; align-items:center; border:1px solid ${tokens.colors.border.search}; border-radius:10px; background:white;`;
const SearchInput = styled.input`
  min-width:0; height:100%; flex:1; padding:0 14px; border:0; outline:0; background:transparent; font:inherit; font-size:${tokens.fontSize.md};
  &::placeholder { color:${tokens.colors.text.placeholder}; }
`;
const SearchButton = styled.button`width:45px; height:100%; padding:0; display:flex; align-items:center; justify-content:center; border:0; background:transparent; cursor:pointer;`;
const SearchIcon = styled.span`
  position:relative; width:15px; height:15px; display:block; border:2px solid ${tokens.colors.text.semiLight}; border-radius:50%;
  &::after { content:''; position:absolute; right:-5px; bottom:-3px; width:7px; height:2px; transform:rotate(48deg); transform-origin:left center; background:${tokens.colors.text.semiLight}; }
`;
const IdeaGrid = styled.div`
  margin-top:50px; display:grid; grid-template-columns:repeat(3,minmax(220px,270px)); justify-content:space-between; gap:54px 72px;
  @media (max-width:1000px) { grid-template-columns:repeat(2,minmax(220px,270px)); justify-content:space-around; }
  @media (max-width:650px) { grid-template-columns:minmax(220px,270px); justify-content:center; }
`;
const EmptyArea = styled.div`margin-top:42px; display:flex; align-items:center; gap:95px;`;
const EmptyCard = styled.div`position:relative; width:270px; height:301px; padding:112px 18px 20px; border:1px dashed #8c8c8c; border-radius:10px; color:${tokens.colors.text.extraLight}; text-align:center;`;
const EmptyClip = styled.span`position:absolute; top:-36px; left:108px; width:55px; height:51px; border-bottom:10px double #8c8c8c;`;
const EmptyTitle = styled.h2`margin:0; font-size:${tokens.fontSize.xl}; font-weight:${tokens.fontWeight.medium};`;
const EmptyDescription = styled.p`margin:18px 0 0; font-size:13px; line-height:1.45;`;
const SearchEmptyDescription = styled.p`margin:0; color:${tokens.colors.text.extraLight}; font-size:${tokens.fontSize.xl};`;
