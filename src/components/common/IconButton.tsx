/*import*/
import styled from 'styled-components';
import React from 'react';

/*Props 타입 정의*/
interface IconButtonProps {
  size: 'xs' | 'sm' | 'md' | 'lg';
  onClick: () => void;
  icon: React.ReactNode;
  ariaLabel: string;
}

/*스타일*/
const sizeMap = {
  xs: '13px', // ... 누르면 삭제 Button 뜸 (댓글, 친구 목록)
  sm: '18px', // 좋아요, 댓글, 친구페이지 검색
  md: '22px', // 검색,  프로필 수정
  lg: '25px', // 필터
};

const StyledIconButton = styled.button<{ size: 'xs' | 'sm' | 'md' | 'lg' }>`
  width: ${({ size }) => sizeMap[size]};
  height: ${({ size }) => sizeMap[size]};
  border: none;
  border-radius: 50%;
  background-color: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

/*IconButton 컴포넌트 정의*/
function IconButton({ size, onClick, icon, ariaLabel }: IconButtonProps) {
  return (
    <StyledIconButton size={size} onClick={onClick} aria-label={ariaLabel}>
      {icon}
    </StyledIconButton>
  );
}

export default IconButton;
