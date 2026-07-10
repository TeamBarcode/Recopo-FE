/*import*/
import styled from 'styled-components';
import React from 'react';

import { tokens } from '@/styles/tokens';

/*
primary : (기록)저장하기, (ai 패널) 저장, 다시 추천받기, 아이디어로 저장, (카드 상세) 추천받기
cancel : (ai 패널)취소
edit : (카드 상세) 수정
danger : (카드 상세) 삭제
text : 답글달기, 필터 전체 초기화
*/

/*Props 타입 정의*/
interface ButtonProps {
  variant: 'primary' | 'cancel' | 'edit' | 'danger' | 'text';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

/*스타일*/
//variant 별로 작성
const StyledButton = styled.button<{
  variant: string;
  $size?: 'sm' | 'md' | 'lg';
  $width?: string;
}>`
  ${({ $width }) => $width && `width: ${$width};`}

  color: ${tokens.colors.text.primary};

  &:active:not(:disabled) {
    opacity: 0.6;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  ${({ variant }) =>
    variant === 'primary' &&
    `
      background-color: ${tokens.colors.button.white};
      border: 1px solid ${tokens.colors.border.search};
      border-radius: ${tokens.radius.sm};
      padding: ${tokens.spacing[8]} ${tokens.spacing[16]};
      font-size: ${tokens.fontSize.md};
    `}

  ${({ variant }) =>
    variant === 'cancel' &&
    `
      background-color: ${tokens.colors.button.white};
      border: 1px solid ${tokens.colors.border.search};
      border-radius: ${tokens.radius.sm};
      padding: ${tokens.spacing[8]} ${tokens.spacing[16]};
      font-size: ${tokens.fontSize.md};
      color: #FF3F3F;
    `}

  ${({ variant }) =>
    variant === 'edit' &&
    `
      background-color: ${tokens.colors.button.white};
      border-radius: ${tokens.radius.md};
      padding: ${tokens.spacing[8]} ${tokens.spacing[16]};
      font-size: ${tokens.fontSize.md};
    `}

  ${({ variant }) =>
    variant === 'danger' &&
    `
      background-color: #EA9191;
      border-radius: ${tokens.radius.md};
      padding: ${tokens.spacing[8]} ${tokens.spacing[16]};
      font-size: ${tokens.fontSize.md};
    `}

  ${({ variant }) =>
    variant === 'text' &&
    `
      background-color: transparent;
      border: none;
      border-radius: 0;
      padding: 0;
      font-size: ${tokens.fontSize.xs};
      color: ${tokens.colors.text.extraLight};
    `}

  /* size가 전달된 경우에만 기존 variant 크기 스타일을 덮어씀 */
  ${({ $size, variant }) =>
    $size === 'sm' &&
    variant !== 'text' &&
    `
      height: 30px;
      padding: 0 ${tokens.spacing[12]};
      font-size: ${tokens.fontSize.sm};
      border-radius: ${tokens.radius.xs};
    `}

  ${({ $size, variant }) =>
    $size === 'md' &&
    variant !== 'text' &&
    `
      height: 36px;
      padding: 0 ${tokens.spacing[16]};
      font-size: ${tokens.fontSize.md};
      border-radius: ${tokens.radius.sm};
    `}

  ${({ $size, variant }) =>
    $size === 'lg' &&
    variant !== 'text' &&
    `
      height: 42px;
      padding: 0 ${tokens.spacing[20]};
      font-size: ${tokens.fontSize.lg};
      border-radius: ${tokens.radius.md};
    `}
`;

/*Button 컴포넌트 정의*/
function Button({
  variant,
  onClick,
  children,
  size,
  width,
  type = 'button',
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <StyledButton
      variant={variant}
      onClick={onClick}
      $size={size}
      $width={width}
      type={type}
      disabled={disabled}
      className={className}
    >
      {children}
    </StyledButton>
  );
}

export default Button;
