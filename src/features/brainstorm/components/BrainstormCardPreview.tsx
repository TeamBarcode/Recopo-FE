import type {BrainstormCard} from '@/mocks/brainstormCards';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import Tag from '@/components/common/Tag';
import {tokens} from '@/styles/tokens';
import tape from '@/assets/tape.svg';

interface BrainstormCardPreviewProps {
    card : BrainstormCard;
}
// 카드마다 다른 데이터를 보여줘야 하니까, 어떤 카드를 그릴지 부모(BrainstormBoard)한테서 값을 받아와야 함 → props로 전달받음

function BrainstormCardPreview({card}: BrainstormCardPreviewProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/brainstorm/${card.id}`);
    };

    return (
        <CardWrapper onClick={handleClick}>
            <Tape src={tape} alt="" />
            <StatusDot>
                <Dot />
                <Dot />
                <Dot />
            </StatusDot>
            <Title>{card.title}</Title>
            <Content>{card.content}</Content>
            <TagRow>
                {card.tags?.map((tag)=>(
                    <Tag key={tag}>{tag}</Tag>
                ))}
                <Tag>{card.category}</Tag>
            </TagRow>
            <DateBadge>
                <DateText>{card.createdAt}</DateText>
            </DateBadge>
        </CardWrapper>
    );
}

export default BrainstormCardPreview;

const CardWrapper = styled.div`
    position : relative;
    display : flex;
    flex-direction : column;
    width : 196px;
    height : 211px;
    background : #FFFD92;
    padding : 35px 10px 10px 12px;
`;

const Tape = styled.img`
    position : absolute;
    left : 78px;
    top : -24px;
`;

const StatusDot = styled.div`
    position : absolute;
    top : 10px;
    left : 10px;
    display : flex;
    gap : 4px;
`;

const Dot = styled.div`
    background : #FF1313;
    width : 5px;
    height : 5px;
    border-radius : 50%;
`;

const Title = styled.div`
    font-size : 13px;
    font-weight : ${tokens.fontWeight.regular};
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1; // 제목 몇 줄까지 허용할지 (피그마 기준으로 정하면 됨)
    -webkit-box-orient: vertical;
`;

const Content = styled.div`
    font-size : 13px;
    font-weight : ${tokens.fontWeight.light};
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 6; // 내용 몇 줄까지 허용할지
    -webkit-box-orient: vertical;
`;

const TagRow = styled.div`
    display : flex;
    gap : 8px;
    margin-top : 20px;
`;

const DateBadge = styled.div`
    width : 50px;
    height : 12px;
    display : flex;
    align-items : center;
    justify-content : center;
    margin-top : auto;
    background : #FFFFFF;
`;
const DateText = styled.div`
    font-size : 9px;
    font-weight : ${tokens.fontWeight.regular};
`;