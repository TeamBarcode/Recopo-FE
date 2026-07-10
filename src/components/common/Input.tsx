/*import*/
import styled from 'styled-components';
import React from 'react';

import { tokens } from '@/styles/tokens';

/*
텍스트 입력 컴포넌트
예: 검색창, 로그인/회원가입 입력창, 프로필 수정 입력창, 브레인스토밍 제목 입력창
*/

/*Props 타입 정의*/
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'width'> {
  size?: 'sm' | 'md' | 'lg';
  width?: string;
}

/*스타일*/
const StyledInput = styled.input<{
  $size: 'sm' | 'md' | 'lg';
  $width: string;
}>`
  width: ${({ $width }) => $width};
  border: none;
  border-radius: ${tokens.radius.sm};
  background-color: transparent;
  color: ${tokens.colors.text.primary};
  box-sizing: border-box;

  /* 친구 검색창 */
  ${({ $size }) =>
    $size === 'sm' &&
    `
      height: 36px;
      padding: 0 ${tokens.spacing[10]};
      font-size: ${tokens.fontSize.md};
    `}

  /* 검색창, 로그인, 정보 수정 */
  ${({ $size }) =>
    $size === 'md' &&
    `
      height: 42px;
      padding: 0 ${tokens.spacing[12]};
      font-size: ${tokens.fontSize.lg};
    `}

  /* 브레인스토밍 제목 입력 */
  ${({ $size }) =>
    $size === 'lg' &&
    `
      height: 28px;
      padding: 0 ${tokens.spacing[16]};
      font-size: ${tokens.fontSize.page};
    `}

  &::placeholder {
    color: ${tokens.colors.text.placeholder};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

/*Input 컴포넌트 정의*/
function Input({ size = 'md', width = '100%', type = 'text', ...inputProps }: InputProps) {
  return <StyledInput {...inputProps} type={type} $size={size} $width={width} />;
}

export default Input;
