/*import*/
import styled from 'styled-components';
import React from 'react';

/*
텍스트 입력 컴포넌트
예: 검색창, 로그인/회원가입 입력창, 프로필 수정 입력창, 브레인스토밍 제목 입력창
*/

/*Props 타입 정의*/
interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  width?: string;
}

/*스타일*/
const StyledInput = styled.input<{ size: 'sm' | 'md' | 'lg'; width: string }>`
  width: ${({ width }) => width};
  border: none;
  border-radius: 10px;
  background-color: transparent;
  color: #000000;
  box-sizing: border-box;

  // 친구 검색창
  ${({ size }) =>
    size === 'sm' &&
    `
      height: 36px;
      padding: 0 10px;
      font-size: 12px;
    `}

  // 검색창, 로그인, 정보 수정
  ${({ size }) =>
    size === 'md' &&
    `
      height: 42px;
      padding: 0 12px;
      font-size: 14px;
    `}

    // 브레인스토밍 제목 입력
  ${({ size }) =>
    size === 'lg' &&
    `
      height: 28px;
      padding: 0 14px;
      font-size: 20px;
    `}

  &::placeholder {
    color: #9e9e9e;
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
function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  size = 'md',
  width = '100%',
}: InputProps) {
  return (
    <StyledInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      size={size}
      width={width}
    />
  );
}

export default Input;
