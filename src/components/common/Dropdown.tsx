import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';

import { tokens } from '@/styles/tokens';

/*
카테고리, 정렬, 전체/공개/비공개
기록할 때 카테고리(더 큼)
*/

/*Props 타입 정의*/
interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  size: 'sm' | 'md';
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

/*스타일*/
const StyledTrigger = styled.button<{
  size: string;
  $isOpen: boolean;
}>`
  box-sizing: border-box;
  text-align: center;
  white-space: nowrap;
  background-color: ${tokens.colors.button.primary};
  color: ${tokens.colors.text.primary};
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: none;
  border: none;

  ${({ $isOpen }) =>
    $isOpen &&
    `
      background-color: ${tokens.colors.border.secondary};
    `}

  ${({ size }) =>
    size === 'sm' &&
    `
      border-radius: ${tokens.radius.xs};
      padding: ${tokens.spacing[8]} ${tokens.spacing[16]};
      font-size: 11px;
    `}

  ${({ size }) =>
    size === 'md' &&
    `
      border-radius: 9px;
      padding: ${tokens.spacing[8]} ${tokens.spacing[20]};
      font-size: ${tokens.fontSize.md};
    `}

  ${({ $isOpen, size }) =>
    $isOpen &&
    size === 'sm' &&
    `
      border-radius: ${tokens.radius.xs} ${tokens.radius.xs} 0 0;
    `}

  ${({ $isOpen, size }) =>
    $isOpen &&
    size === 'md' &&
    `
      border-radius: 9px 9px 0 0;
    `}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledContent = styled.div<{ size: string }>`
  position: absolute;
  z-index: 10;
  min-width: 100%;
  width: max-content;
  background-color: ${tokens.colors.border.secondary};
  border-radius: 0 0 ${tokens.radius.xs} ${tokens.radius.xs};

  ${({ size }) =>
    size === 'sm' &&
    `
      font-size: 11px;
    `}

  ${({ size }) =>
    size === 'md' &&
    `
      font-size: ${tokens.fontSize.md};
    `}
`;
/* 
position: absolute — 목록이 문서 흐름에서 빠져나와 "둥둥 뜬 채로" 그려지게 함. 이래야 목록이 열려도 Toolbar나 다른 요소들이 안 밀림 (이게 핵심 이유)
min-width: 100% — 옵션이 다 짧아도, 목록 박스가 트리거 버튼보다 좁아 보이진 않게 최소 크기 보장
width: max-content — "콘텐츠/미디어"처럼 긴 옵션이 있으면, 그 옵션이 한 줄로 다 들어갈 만큼 박스가 알아서 넓어짐 (처음에 두 줄 되던 문제 해결)
*/

const StyledItem = styled.div<{ size: string }>`
  color: ${tokens.colors.text.primary};
  border-top: 1px solid #b7b7b7;
  white-space: nowrap;

  ${({ size }) =>
    size === 'sm' &&
    `
      height: 27px;
      display: flex;
      align-items: center;
      padding: 0 ${tokens.spacing[16]};
    `}

  ${({ size }) =>
    size === 'md' &&
    `
      height: 30px;
      display: flex;
      align-items: center;
      padding: 0 ${tokens.spacing[20]};
    `}
`; /*아이템 한 칸 높이를 카테고리 높이랑 맞추기 위해 고정값을 넣음*/


const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  flex-shrink: 0;
`;


/*Dropdown 컴포넌트 정의*/
function Dropdown({
  options,
  value,
  onChange,
  size,
  placeholder,
  disabled = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = isOpen && !disabled;
  const wrapperRef = useRef<HTMLDivElement>(null);

  /*드롭다운 바깥 영역을 클릭하면 닫기*/
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      console.log('바깥 클릭 감지됨, 대상:', event.target);
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        console.log('→ 바깥이라고 판단, 닫음');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <Wrapper ref={wrapperRef} className={className}>
      <StyledTrigger
        type="button"
        size={size}
        $isOpen={open}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((previous) => !previous);
          }
        }}
      >
        {value || placeholder} ▼
      </StyledTrigger>

      {open && (
        <StyledContent size={size}>
          {options.map((option) => (
            <StyledItem
              key={option}
              size={size}
              onClick={() => {
                console.log('클릭됨:', option, '현재 value:', value);
                onChange(option === value ? '' : option);
                setIsOpen(false);
              }}
            >
              {option}
            </StyledItem>
          ))}
        </StyledContent>
      )}
    </Wrapper>
  );
}

export default Dropdown;
