/*import*/
import styled from "styled-components";
import React from "react";

/*
primary : (기록)저장하기, (ai 패널) 저장, 다시 추천받기, 아이디어로 저장, (카드 상세) 추천받기
cancel : (ai 패널)취소
edit : (카드 상세) 수정
danger : (카드 상세) 삭제
text : 답글달기, 필터 전체 초기화
*/


/*Props 타입 정의*/
interface ButtonProps {
    variant : "primary" | "cancel" | "edit" | "danger" | "text"
    onClick: () => void
    children : React.ReactNode
}

/*스타일*/
//variant 별로 작성
const StyledButton = styled.button<{ variant : string }>`
    color: #000000;
    &:active { opacity: 0.6; }
    
    ${({variant}) => variant === 'primary' &&`
        background-color : #FFFFFF;
        border : 1px solid #E4E4E4;
        border-radius : 10px;
        padding : 8px 16px;
        font-size : 12px;
    `}
    ${({variant}) => variant === 'cancel' &&`
        background-color : #FFFFFF;
        border : 1px solid #E4E4E4;
        border-radius : 10px;
        padding : 8px 16px;
        font-size : 12px ;
        color : #FF3F3F;
    `}
    ${({variant}) => variant === 'edit' &&`
        background-color : #FFFFFF;
        border-radius :15px;
        padding : 8px 16px;
        font-size : 12px;
    `}
    ${({variant}) => variant === 'danger' &&`
        background-color : #EA9191;
        border-radius : 15px;
        padding : 8px 16px;
        font-size : 12px;
    `}
    ${({variant}) => variant === 'text' && `
        background-color : transparent; 
        border :none;
        border-radius : 0; 
        padding : 0;
        font-size : 8px;
        color : #696969;
    `}
`;

/*Button 컴포넌트 정의*/
function Button({variant, onClick, children} : ButtonProps) {
    return (
        <StyledButton variant = {variant} onClick = {onClick}>
            {children}
        </StyledButton>
    );
};

export default Button; 