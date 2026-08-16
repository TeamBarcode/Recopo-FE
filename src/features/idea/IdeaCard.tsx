import type { KeyboardEvent } from 'react';
import styled from 'styled-components';

import type { IdeaCard as IdeaCardData } from '@/mocks/ideaCards';
import type { Category } from '@/components/common/Tag';
import Tag from '@/components/common/Tag';
import { tokens } from '@/styles/tokens';
import heartIcon from '@/assets/idea-heart.svg';
import commentIcon from '@/assets/idea-comment.svg';
import visibilityPublicIcon from '@/assets/idea-visibility-public.svg';
import visibilityPrivateIcon from '@/assets/idea-visibility-private.svg';
import clipIcon from '@/assets/idea-clip.svg';

interface IdeaCardProps { idea: IdeaCardData; onClick: () => void; hideVisibility?: boolean; }

function IdeaCard({ idea, onClick, hideVisibility }: IdeaCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); }
  };

  return (
    <Card tabIndex={0} role="link" onClick={onClick} onKeyDown={handleKeyDown}>
      <Clip src={clipIcon} alt="" aria-hidden="true" />
      <CardBody>
        <TopRow>
          <Title>{idea.title}</Title>
          {!hideVisibility && (
            <VisibilityIcon
              src={idea.isPublic ? visibilityPublicIcon : visibilityPrivateIcon}
              alt={idea.isPublic ? '공개' : '비공개'}
            />
          )}
        </TopRow>
        <TagRow>
          {idea.tags?.map((tag) => (
            <Tag key={tag} variant="hashtag" usage="idea">{tag}</Tag>
          ))}
          <Tag variant="category" usage="idea" category={idea.category as Category}>{idea.category}</Tag>
        </TagRow>
        <Summary>{idea.summary}</Summary>
        <Footer>
          <Date>{idea.createdAt}</Date>
          <Reactions>
            <span><ReactionIcon src={heartIcon} alt="" />{idea.likeCount}개</span>
            <span><ReactionIcon src={commentIcon} alt="" />{idea.commentCount}개</span>
          </Reactions>
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
const Clip = styled.img`position:absolute; z-index:1; top:0; left:50%; width:55px; height:51px; transform:translateX(-50%);`;
const TopRow = styled.div`display:flex; align-items:center; justify-content:space-between; gap:12px;`;
const Title = styled.h2`margin:0; overflow:hidden; font-size:${tokens.fontSize.xl}; font-weight:400; line-height:1.2; text-overflow:ellipsis; white-space:nowrap;`;
const VisibilityIcon = styled.img`flex-shrink:0; width:21px; height:21px;`;
const TagRow = styled.div`min-height:21px; margin-top:22px; display:flex; align-items:center; gap:8px; overflow:hidden;`;
const Summary = styled.p`
  margin:17px 4px 0; display:-webkit-box; overflow:hidden; font-size:${tokens.fontSize.md}; line-height:1.4;
  -webkit-box-orient:vertical; -webkit-line-clamp:4;
`;
const Footer = styled.div`position:absolute; right:12px; bottom:11px; left:12px; display:flex; align-items:center; justify-content:space-between;`;
const Date = styled.span`padding:3px 7px; background:${tokens.colors.button.light}; font-size:${tokens.fontSize.sm};`;
const Reactions = styled.div`
  display:flex; gap:13px; color:${tokens.colors.text.light}; font-size:11px;
  span { display:flex; align-items:center; gap:4px; }
`;
const ReactionIcon = styled.img`width:13px; height:13px;`;
