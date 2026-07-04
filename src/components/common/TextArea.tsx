/*import*/
import styled from 'styled-components';
import React from 'react';

/*
여러 줄 텍스트 입력 컴포넌트
예: 댓글 입력, 브레인스토밍 내용 입력
*/

/*Props 타입 정의*/
interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  width?: string;
}

/*사이즈별 기본 width*/
const widthMap = {
  sm: '436px',
  md: '672px',
};

/*스타일*/
const StyledTextArea = styled.textarea<{ size: 'sm' | 'md'; width?: string }>`
  width: ${({ size, width }) => width || widthMap[size]};
  border: none;
  border-radius: 10px;
  background-color: transparent;
  color: #000000;
  resize: none;
  box-sizing: border-box;

  ${({ size }) =>
    size === 'sm' &&
    `
      min-height: 200px;
      padding: 8px 10px;
      font-size: 13px;
    `}

  ${({ size }) =>
    size === 'md' &&
    `
      min-height: 120px;
      padding: 12px;
      font-size: 15px;
    `}

  &::placeholder {
    color: #9e9e9e;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

/*TextArea 컴포넌트 정의*/
function TextArea({
  value,
  onChange,
  placeholder,
  disabled = false,
  size = 'md',
  width,
}: TextAreaProps) {
  return (
    <StyledTextArea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      width={width}
    />
  );
}

export default TextArea;
