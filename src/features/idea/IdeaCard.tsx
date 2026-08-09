import type { KeyboardEvent } from 'react';
import styled from 'styled-components';

import type { Idea } from '@/features/idea/ideaData';
import { tokens } from '@/styles/tokens';

interface IdeaCardProps { idea: Idea; onClick: () => void; }

function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); }
  };

  return (
    <Card tabIndex={0} role="link" onClick={onClick} onKeyDown={handleKeyDown}>
      <Clip aria-hidden="true"><ClipRing /><ClipBar /></Clip>
      <CardBody>
        <TopRow><Title>{idea.title}</Title><Visibility aria-label={idea.visibility}>{idea.visibility === '공개' ? '◎' : '▣'}</Visibility></TopRow>
        <TagRow>
          {idea.tags.map((tag) => <Tag key={tag}>#{tag}</Tag>)}
          <Category>{idea.category}</Category>
        </TagRow>
        <RepositoryCount>레포 {idea.repositoryCount}개</RepositoryCount>
        <Summary>{idea.summary}</Summary>
        <Footer>
          <Date>{idea.createdAt}</Date>
          <Reactions><span>♡ {idea.likeCount}개</span><span>◌ {idea.commentCount}개</span></Reactions>
        </Footer>
      </CardBody>
    </Card>
  );
}

export default IdeaCard;

const Card = styled.article`
  position: relative; width: 100%; max-width: 270px; height: 336px; padding-top: 35px; cursor: pointer;
  &:focus-visible { outline: 2px solid ${tokens.colors.text.light}; outline-offset: 5px; }
`;
const CardBody = styled.div`
  position: relative; height: 301px; padding: 26px 21px 12px; background: white;
  border: 1px solid ${tokens.colors.border.primary}; box-shadow: 0 3px 3px rgba(0,0,0,.25);
`;
const Clip = styled.div`position:absolute; z-index:1; top:0; left:50%; width:55px; height:51px; transform:translateX(-50%);`;
const ClipRing = styled.span`position:absolute; top:0; left:21px; width:14px; height:14px; border:5px solid #5d5d5d; border-radius:50%; background:white;`;
const ClipBar = styled.span`
  position:absolute; bottom:2px; left:7px; width:42px; height:11px; border:5px solid #5d5d5d; border-radius:8px;
  &::before { content:''; position:absolute; bottom:6px; left:14px; width:5px; height:18px; background:#5d5d5d; }
`;
const TopRow = styled.div`display:flex; align-items:center; justify-content:space-between; gap:12px;`;
const Title = styled.h2`margin:0; overflow:hidden; font-size:${tokens.fontSize.xl}; font-weight:400; line-height:1.2; text-overflow:ellipsis; white-space:nowrap;`;
const Visibility = styled.span`flex-shrink:0; color:${tokens.colors.text.light}; font-size:20px; line-height:1;`;
const TagRow = styled.div`min-height:21px; margin-top:22px; display:flex; align-items:center; gap:8px; overflow:hidden;`;
const Tag = styled.span`flex-shrink:0; padding:5px 11px; border-radius:13px; background:${tokens.colors.button.light}; font-size:10px; line-height:1;`;
const Category = styled(Tag)`background:${tokens.colors.button.focus};`;
const RepositoryCount = styled.p`margin:17px 4px 0; color:${tokens.colors.text.semiLight}; font-size:${tokens.fontSize.md};`;
const Summary = styled.p`
  margin:13px 4px 0; display:-webkit-box; overflow:hidden; font-size:${tokens.fontSize.md}; line-height:1.4;
  -webkit-box-orient:vertical; -webkit-line-clamp:4;
`;
const Footer = styled.div`position:absolute; right:12px; bottom:11px; left:12px; display:flex; align-items:center; justify-content:space-between;`;
const Date = styled.span`padding:3px 7px; background:${tokens.colors.button.light}; font-size:${tokens.fontSize.sm};`;
const Reactions = styled.div`display:flex; gap:13px; color:${tokens.colors.text.light}; font-size:11px;`;
