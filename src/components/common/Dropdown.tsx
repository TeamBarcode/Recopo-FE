import styled from "styled-components";
import { useState } from "react";

/*
카테고리, 정렬, 전체/공개/비공개
기록할 때 카테고리(더 큼)
*/

/*Props 타입 정의*/
interface DropdownProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  size: 'sm' | 'md'
  placeholder: string
}

/*스타일*/
const StyledTrigger = styled.button<{ size: string; isOpen: boolean }>`
  background-color: #EEEEEE;
  color: #000000;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: none;
  border: none;

  ${({ isOpen }) => isOpen && `
    background-color: #D9D9D9;
  `}

  ${({ size }) => size === 'sm' && `
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 11px;
  `}
  ${({ size }) => size === 'md' && `
    border-radius: 9px;
    padding: 8px 20px;
    font-size: 12px;
  `}

  ${({ isOpen, size }) => isOpen && size === 'sm' && `
    border-radius: 8px 8px 0 0;
  `}
  ${({ isOpen, size }) => isOpen && size === 'md' && `
    border-radius: 9px 9px 0 0;
  `}
`

const StyledContent = styled.div<{ size: string }>`
  background-color: #D9D9D9;
  border-radius: 0 0 8px 8px;
  position: absolute;
  width: 100%;


  ${({ size }) => size === 'sm' && `
    font-size: 11px;
  `}
  ${({ size }) => size === 'md' && `
    font-size: 12px;
  `}
`

const StyledItem = styled.div<{ size: string }>`
  color: #000000;
  border-top: 1px solid #B7B7B7;

  ${({ size }) => size === 'sm' && `
    height: 27px;
    display: flex;
    align-items: center;
    padding: 0 16px;
  `}
  ${({ size }) => size === 'md' && `
    height: 30px;
    display: flex;
    align-items: center;
    padding: 0 20px;
  `}
` /*아이템 한 칸 높이를 카테고리 높이랑 맞추기 위해 고정값을 넣음*/


const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`

/*Dropdown 컴포넌트 정의*/
function Dropdown({ options, value, onChange, size, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Wrapper>
      <StyledTrigger size={size} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {value || placeholder} ▼
      </StyledTrigger>
      {isOpen && (
        <StyledContent size={size}>
          {options.map((option) => (
            <StyledItem
              key={option}
              size={size}
              onClick={() => {
                onChange(option === value ? '' : option)
                setIsOpen(false)
              }}
            >
              {option}
            </StyledItem>
          ))}
        </StyledContent>
      )}
    </Wrapper>
  )
}

export default Dropdown;