import type { ReactNode } from 'react';
import styled from 'styled-components';

import { colors } from '@/styles/tokens';

export type Category =
  '콘텐츠/미디어' | '생활' | '건강' | '업무/도구' | '개발/디자인' | '사람' | '기타';

type TagUsage = 'idea' | 'brainstorm';

interface CategoryTagProps {
  children: ReactNode;
  variant: 'category';
  usage: TagUsage;
  category: Category;
}

interface HashtagTagProps {
  children: ReactNode;
  variant: 'hashtag';
  usage: TagUsage;
  category?: never;
}

type TagProps = CategoryTagProps | HashtagTagProps;

const categoryColors: Record<Category, string> = {
  '콘텐츠/미디어': colors.category.contentMedia,
  생활: colors.category.lifestyle,
  건강: colors.category.health,
  '업무/도구': colors.category.workTool,
  '개발/디자인': colors.category.developmentDesign,
  사람: colors.category.people,
  기타: colors.category.other,
};

interface StyledTagProps {
  $variant: TagProps['variant'];
  $usage: TagUsage;
  $category?: Category;
}

const getBackgroundColor = ({ $variant, $usage, $category }: StyledTagProps) => {
  if ($usage === 'brainstorm') {
    return colors.tag.brainstorm;
  }

  if ($variant === 'hashtag') {
    return colors.button.light;
  }

  return categoryColors[$category!];
};

const StyledTag = styled.span<StyledTagProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 19px;
  flex-shrink: 0;
  padding: 0 8px;
  border-radius: 9999px;
  background-color: ${getBackgroundColor};
  font-size: 9px;
  white-space: nowrap;
`;

function Tag(props: TagProps) {
  const { children, variant, usage } = props;
  const category = variant === 'category' ? props.category : undefined;

  return (
    <StyledTag $variant={variant} $usage={usage} $category={category}>
      {children}
    </StyledTag>
  );
}

export default Tag;
