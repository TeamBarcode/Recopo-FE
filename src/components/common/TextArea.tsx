/*import*/
import styled from 'styled-components';
import React from 'react';

import { tokens } from '@/styles/tokens';

/*
여러 줄 텍스트 입력 컴포넌트
예: 댓글 입력, 브레인스토밍 내용 입력
*/

/*Props 타입 정의*/
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md';
  width?: string;
}

/*사이즈별 기본 width*/
const widthMap = {
  sm: '436px',
  md: '672px',
};

/*스타일*/
const StyledTextArea = styled.textarea<{
  $size: 'sm' | 'md';
  $width?: string;
}>`
  width: ${({ $size, $width }) => $width || widthMap[$size]};
  border: none;
  border-radius: ${tokens.radius.sm};
  background-color: transparent;
  color: ${tokens.colors.text.primary};
  resize: none;
  box-sizing: border-box;

  ${({ $size }) =>
    $size === 'sm' &&
    `
      min-height: 200px;
      padding: ${tokens.spacing[8]} ${tokens.spacing[10]};
      font-size: 13px;
    `}

  ${({ $size }) =>
    $size === 'md' &&
    `
      min-height: 120px;
      padding: ${tokens.spacing[12]};
      font-size: 15px;
    `}

  &::placeholder {
    color: ${tokens.colors.text.placeholder};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

/*TextArea 컴포넌트 정의*/
function TextArea({ size = 'md', width, ...textAreaProps }: TextAreaProps) {
  return <StyledTextArea {...textAreaProps} $size={size} $width={width} />;
}

export default TextArea;
