import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Dropdown from '@/components/common/Dropdown';
import IdeaCard from '@/features/idea/IdeaCard';
import { categoryOptions, sortOptions, visibilityOptions } from '@/features/idea/ideaData';
import { fetchMockIdeas } from '@/mocks/ideaCards';
import type { IdeaCard as IdeaCardData } from '@/mocks/ideaCards';
import { tokens } from '@/styles/tokens';
import clipIcon from '@/assets/idea-clip.svg';

const SORT_VALUE_MAP = {
  최신순: 'latest',
  오래된순: 'oldest',
  좋아요순: 'popular',
} as const;

function IdeaPage() {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState('전체');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaCardData[]>([]);

  useEffect(() => {
    fetchMockIdeas(
      visibility as '전체' | '공개' | '비공개',
      category === '전체' || !category ? undefined : category,
      SORT_VALUE_MAP[sort as keyof typeof SORT_VALUE_MAP],
      searchTerm.trim().replace(/^#/, '') || undefined,
    ).then(setFilteredIdeas);
  }, [category, searchTerm, sort, visibility]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const searchEmpty = searchTerm.length > 0 && filteredIdeas.length === 0;

  return (
    <Page>
      <ContentArea>
        <Toolbar>
          <PageTitle>Idea</PageTitle>
          <FilterGroup>
            <Filters>
              <Dropdown options={visibilityOptions} value={visibility} onChange={(value) => setVisibility(value || '전체')} size="sm" placeholder="전체" />
              <Dropdown options={categoryOptions} value={category} onChange={(value) => setCategory(value)} size="sm" placeholder="카테고리" />
              <Dropdown options={sortOptions} value={sort} onChange={setSort} size="sm" placeholder="정렬" />
            </Filters>
            <SearchForm onSubmit={handleSearch} role="search">
              <SearchInput value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="제목 또는 해시태그 검색" aria-label="아이디어 검색" />
              <SearchButton type="submit" aria-label="검색"><SearchIcon aria-hidden="true" /></SearchButton>
            </SearchForm>
          </FilterGroup>
        </Toolbar>

        {filteredIdeas.length > 0 ? (
          <IdeaGrid>
            {filteredIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} onClick={() => navigate(`/ideas/${idea.id}`)} />)}
          </IdeaGrid>
        ) : (
          <EmptyArea>
            <EmptyCard>
              <EmptyClip src={clipIcon} alt="" aria-hidden="true" />
              <EmptyTitle>{searchEmpty ? '검색 결과 없음' : '아이디어가 없어요!'}</EmptyTitle>
              {!searchEmpty && <EmptyDescription><strong>Recobot</strong>과 함께 브레인스토밍 카드를<br />아이디어로 만들어 보세요</EmptyDescription>}
            </EmptyCard>
            {searchEmpty && <SearchEmptyDescription>해당 검색어와 일치하는 제목 또는 태그가 없습니다</SearchEmptyDescription>}
          </EmptyArea>
        )}
      </ContentArea>
    </Page>
  );
}

export default IdeaPage;

const Page = styled.section`width:100%; padding:4px 28px 80px;`;
const ContentArea = styled.div`
  width:100%; max-width:970px; margin:0 auto;
  @media (max-width:1000px) { max-width:620px; }
  @media (max-width:650px) { max-width:270px; }
`;
const PageTitle = styled.h1`margin:0; font-family:${tokens.fontFamily.logo}; font-size:${tokens.fontSize.page}; font-weight:400;`;
const Toolbar = styled.div`display:flex; align-items:center; justify-content:space-between;`;
const FilterGroup = styled.div`display:flex; align-items:flex-start; gap:37px;`;
const Filters = styled.div`
  position:relative; z-index:10; display:flex; align-items:flex-start; gap:12px;
  button { white-space:nowrap; } > div > div { z-index:20; }
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
  margin-top:36px; display:grid; grid-template-columns:repeat(3,minmax(220px,270px)); justify-content:center; gap:40px 80px;
  @media (max-width:1000px) { grid-template-columns:repeat(2,minmax(220px,270px)); justify-content:center; }
  @media (max-width:650px) { grid-template-columns:minmax(220px,270px); justify-content:center; }
`;
const EmptyArea = styled.div`margin-top:42px; display:flex; align-items:center; gap:95px;`;
const EmptyCard = styled.div`position:relative; width:270px; height:301px; padding:112px 18px 20px; border:1px dashed #8c8c8c; border-radius:10px; color:${tokens.colors.text.extraLight}; text-align:center;`;
const EmptyClip = styled.img`position:absolute; top:-36px; left:108px; width:55px; height:51px;`;
const EmptyTitle = styled.h2`margin:0; font-size:${tokens.fontSize.xl}; font-weight:${tokens.fontWeight.medium};`;
const EmptyDescription = styled.p`margin:18px 0 0; font-size:13px; line-height:1.45;`;
const SearchEmptyDescription = styled.p`margin:0; color:${tokens.colors.text.extraLight}; font-size:${tokens.fontSize.xl};`;
