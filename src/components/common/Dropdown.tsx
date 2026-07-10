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
  isOpen: boolean;
}>`
  background-color: ${tokens.colors.button.primary};
  color: ${tokens.colors.text.primary};
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: none;
  border: none;

  ${({ isOpen }) =>
    isOpen &&
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

  ${({ isOpen, size }) =>
    isOpen &&
    size === 'sm' &&
    `
      border-radius: ${tokens.radius.xs} ${tokens.radius.xs} 0 0;
    `}

  ${({ isOpen, size }) =>
    isOpen &&
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
  background-color: ${tokens.colors.border.secondary};
  border-radius: 0 0 ${tokens.radius.xs} ${tokens.radius.xs};
  position: absolute;
  width: 100%;

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

const StyledItem = styled.div<{ size: string }>`
  color: ${tokens.colors.text.primary};
  border-top: 1px solid #b7b7b7;

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
  const wrapperRef = useRef<HTMLDivElement>(null);

  /*드롭다운 바깥 영역을 클릭하면 닫기*/
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  /*열려 있는 상태에서 disabled가 되면 닫기*/
  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  return (
    <Wrapper ref={wrapperRef} className={className}>
      <StyledTrigger
        type="button"
        size={size}
        isOpen={isOpen}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((previous) => !previous);
          }
        }}
      >
        {value || placeholder} ▼
      </StyledTrigger>

      {isOpen && (
        <StyledContent size={size}>
          {options.map((option) => (
            <StyledItem
              key={option}
              size={size}
              onClick={() => {
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
