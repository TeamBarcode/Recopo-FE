import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchMockCardDetail, deleteMockBrainstormCard } from '@/mocks/brainstormCards';
import type { BrainstormCardDetail } from '@/mocks/brainstormCards';
import tape from '@/assets/tape.svg';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {tokens} from '@/styles/tokens';
import Tag from '@/components/common/Tag';

function CardDetail() {
    const{cardId} = useParams();
    const navigate = useNavigate();
    const[card, setCard] = useState<BrainstormCardDetail | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    useEffect(() => {
        if(!cardId) return; //값이 없으면 멈추기
        fetchMockCardDetail(cardId).then(setCard); //카드 정보 가져와서 setCard한테 넘겨서 실행 -> 리렌더링 발생
    }, [cardId]); // cardId 바뀔 때마다 함수 실행
    
    if(!card) return <div>로딩중...</div>;

    const handleEdit = () => {
        navigate(`/brainstorm/${cardId}/edit`);
    }
    //수정 버튼 누르면 이 카드의 수정 페이지(/brainstorm/:cardId/edit)로 이동시킴. 이 라우트는 EditRecordPage가 받아서, 그 안에서 다시 카드 데이터 불러온 다음 <RecordForm mode="edit" .../>를 렌더링하는 구조
    
    const handleDelete= () => {
        setIsDeleteModalOpen(true);
    }; // 삭제 버튼 클릭하면 handleDelete 실행됨, isDeleteModalOpen가 true가 됨 -> 모달이 화면에 뜸

    const handleConfirmDelete = async () => {
        if(!cardId) return;
        await deleteMockBrainstormCard(cardId);
        navigate('/');
    }; //모달에서 네를 클릭하면 실행되는 부분.
    /*
    if (!cardId) return; — cardId 없으면 그냥 멈추는 안전장치
    await deleteMockBrainstormCard(cardId); — 이때 비로소 진짜로 mock 배열에서 이 카드를 지우는 함수가 실행되고, 끝날 때까지 기다림
    navigate('/'); — 삭제 다 끝나면 홈 화면으로 이동
    */
    
    const handleRecommend = () => {
        console.log('추천받기 버튼 클릭');
        //Todo : 나중에 RecoBot 호출 로직 추가
    };

    return(
        <>
        <DetailWrapper>
            <NoteWrapper>
                <Tape src={tape} alt="" />
                <TopRight>
                    <SmallButton variant="edit" onClick={handleEdit}>수정</SmallButton> 
                    <SmallButton variant="danger" onClick={handleDelete}>삭제</SmallButton>
                </TopRight>

                <TitleRow>
                    {/* card.title 표시 */}
                    <Title>{card.title}</Title>
                    {/* card.tags?.map(tag => <Chip key={tag}>{tag}</Chip>) */}
                    {card.tags?.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                    <Tag>{card.category}</Tag>
                </TitleRow>

                <Content>{card.content}</Content>

                <DateBadge>
                    <DateText>{card.createdAt}</DateText>
                </DateBadge>
            </NoteWrapper>

            <RecoSection>
                <RecoSectionLabel>RecoBot의 추천결과</RecoSectionLabel>

                {card.recoBotResult === null ? (
                    <NoRecoState>
                        <NoRecoText>
                            아직 추천받지 않은 아이디어예요.
                            <br />
                            RecoBot에게 맞는 레포를 추천받아보세요.
                        </NoRecoText>
                        <Button variant="primary" onClick={handleRecommend}>
                            추천받기
                        </Button>
                    </NoRecoState>
                ) : (
                    <div>{/*Todo : 추천결과 있을 때 디자인 미정*/}</div>
                )}
            </RecoSection>
        </DetailWrapper>
        <Modal type="confirm" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} message="정말 삭제하시겠어요?"/>
        </>
    );
}

export default CardDetail;

const Tape = styled.img`
  position: absolute;
  top: -21px;
  left: 324px;
  width: 40px;
  height: 44px;
`;

const DetailWrapper = styled.div`
  margin-top: 20px; /* 170 - 150(헤더) */
`;

const NoteWrapper = styled.div`
  position: relative;
  width: 744px; 
  margin: 0 auto; /* 컬럼 안에서 좌우 중앙 정렬 */
  padding: 35px 33px 40px 42px; /* top right bottom left */
  display: flex;
  flex-direction: column;
  background: #FFFD92; 
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25); 
`;

const TopRight = styled.div`
  position: absolute;
  top: 12px;
  right: 33px;
  display: flex;
  gap: 8px; /* 수정/삭제 버튼 사이 간격 */
`;

const SmallButton = styled(Button)`
    width : 43px;
    height : 17px;
    padding : 0;
    border-radius : 15px;
    font-size : 10px;
    border : none;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 21px; /* 제목-태그 사이 간격 */
`;

const Title = styled.span`
  font-size: 20px;
  font-weight: ${tokens.fontWeight.regular};
`;

const Content = styled.p`
  font-size: 15px;
  font-weight: ${tokens.fontWeight.light};
  white-space: pre-wrap;
  margin-bottom : 14px;
`;

const DateBadge = styled.div`
    position : absolute;
    bottom : 14px;
    left : 42px;
    width : 50px;
    height : 13px;
    background : #FFFFFF;
    display : flex;
    align-items : center;
    justify-content : center;
`
const DateText = styled.div`
  font-size: 9px;
`;

const RecoSection = styled.div`
  width: 744px;
  margin: 24px auto 0;
`;

const RecoSectionLabel = styled.div`
    width : 140px;
    height : 35px;
    background: #FFB57D;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom : 50px;
`;

const NoRecoState = styled.div`
    display : flex;
    flex-direction : column;
    align-items : center;
    gap : 12px;
    margin : 0 auto;
`;

const NoRecoText = styled.p`
    text-align : center;
`;