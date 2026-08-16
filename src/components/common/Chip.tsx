/*import*/
import styled from "styled-components";

/*
ai 패널 필터 정렬 칩 선택
*/

/*Props 타입 정의*/
interface ChipProps{
    label : string //칩 안 텍스트
    onClick : () => void
    isSelected : boolean //선택됐는지
}

/*스타일*/
//선택됐을 때랑 안 됐을 때 스타일이 달라야 하니까 isSelected로 나누기
const StyledChip = styled.button<{isSelected : boolean}>`
    border-radius : 16px;
    font-size : 7px;
    padding : 5px 12px;
    outline: none; 
    appearance: none; 
    -webkit-appearance: none;
    box-shadow: none;
    border: none;

    ${({isSelected}) => isSelected &&`
        background-color : #434343;
        color : #FFFFFF;
    `}
    ${({isSelected}) => !isSelected &&`
        background-color : #EBEBEB;
        color : #373737;
    `}
`;

/*Chip 컴포넌트 정의*/
function Chip({label, onClick, isSelected} : ChipProps){
    return(
        <StyledChip isSelected = {isSelected} onClick = {onClick}>
            {label}
        </StyledChip>
    );
};

export default Chip;
