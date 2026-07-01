/*import*/
import styled from "styled-components";
import React from "react";

/*
lg : 기록 버튼
sm : ai 패널 보내기, 댓글 보내기 버튼
*/

/*Props 타입 정의*/
interface FABProps {
    size: 'lg' | 'sm' // 기록버튼(lg), 보내기버튼(sm)
    onClick: () => void
    icon : React.ReactNode
}

/*스타일*/
const StyledFAB = styled.button<{size : string}>`
    border-radius: 50%;
    &:active { opacity: 0.6; }

    ${({size}) => size === 'lg' &&`
        width : 56.43px;
        height : 56.43px;
        border : 1px solid #E2E2E2;
        background-color : #F5F5F5;
        box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25); 
    `}
    ${({size}) => size === 'sm' &&`
        width :  31.24px;
        height : 31.24px;
        border : 1px solid #E5E5E5;
        background-color : #FDFDFD;
    `}
`;

/*FAB 컴포넌트 정의*/
function FAB({size, onClick, icon} : FABProps) {
    return (
        <StyledFAB size = {size} onClick = {onClick}>
            {icon}
        </StyledFAB>
    );
}; //실제로 쓸 때 아이콘 넣어주기

export default FAB;