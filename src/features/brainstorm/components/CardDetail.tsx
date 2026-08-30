import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import styled from 'styled-components';
import { fetchMockCardDetail, deleteMockBrainstormCard } from '@/mocks/brainstormCards';
import type { BrainstormCardDetail } from '@/mocks/brainstormCards';
import { createMockIdeaFromRecommendation } from '@/mocks/ideaCards';
import type { RecoItem } from '@/mocks/recobot';
import tape from '@/assets/tape.svg';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Modal from '@/components/common/Modal';
import {tokens} from '@/styles/tokens';
import Tag from '@/components/common/Tag';

interface CardDetailProps {
    onRecommend?: (card: {
        id: string;
        title: string;
        content: string;
        category: string;
        tags?: string[];
    }) => void;
}

export interface CardDetailHandle {
    // RecoBotPanel에서 추천 결과를 카드에 보관한 뒤, 이 화면의 추천결과 목록을 다시 불러오게 함
    refetch: () => void;
}

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

function CardDetail({ onRecommend }: CardDetailProps, ref: React.ForwardedRef<CardDetailHandle>) {
    const{cardId} = useParams();
    const navigate = useNavigate();
    const[card, setCard] = useState<BrainstormCardDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteFailedModalOpen, setIsDeleteFailedModalOpen] = useState(false);
    const isDeletingRef = useRef(false);
    const [selectedRecoId, setSelectedRecoId] = useState<string | null>(null);
    const [isSaveIdeaModalOpen, setIsSaveIdeaModalOpen] = useState(false);

    const loadCard = useCallback(() => {
        if(!cardId) return; //값이 없으면 멈추기
        fetchMockCardDetail(cardId)
            .then((data) => {
                setError(null);
                setCard(data);
            })
            .catch((err) => setError(err?.message ?? '카드를 불러오지 못했어요'));
    }, [cardId]);

    useEffect(() => {
        loadCard();
    }, [loadCard]); // cardId 바뀔 때마다 함수 실행

    useImperativeHandle(ref, () => ({ refetch: loadCard }));

    if (error) {
        return (
            <ErrorState
                title={error}
                description="삭제되었거나 잘못된 링크일 수 있어요"
                actionLabel="홈으로"
                onAction={() => navigate('/')}
                minHeight="480px"
                size="lg"
            />
        );
    }

    if(!card) return <Loading />;

    const handleEdit = () => {
        navigate(`/brainstorm/${cardId}/edit`);
    }
    //수정 버튼 누르면 이 카드의 수정 페이지(/brainstorm/:cardId/edit)로 이동시킴. 이 라우트는 EditRecordPage가 받아서, 그 안에서 다시 카드 데이터 불러온 다음 <RecordForm mode="edit" .../>를 렌더링하는 구조
    
    const handleDelete= () => {
        setIsDeleteModalOpen(true);
    }; // 삭제 버튼 클릭하면 handleDelete 실행됨, isDeleteModalOpen가 true가 됨 -> 모달이 화면에 뜸

    const handleConfirmDelete = async () => {
        if(!cardId || isDeletingRef.current) return;
        isDeletingRef.current = true;
        setIsDeleteModalOpen(false);
        try {
            await deleteMockBrainstormCard(cardId);
            navigate('/');
        } catch {
            setIsDeleteFailedModalOpen(true);
        } finally {
            isDeletingRef.current = false;
        }
    }; //모달에서 네를 클릭하면 실행되는 부분.
    /*
    if (!cardId) return; — cardId 없으면 그냥 멈추는 안전장치
    await deleteMockBrainstormCard(cardId); — 이때 비로소 진짜로 mock 배열에서 이 카드를 지우는 함수가 실행되고, 끝날 때까지 기다림
    navigate('/'); — 삭제 다 끝나면 홈 화면으로 이동
    */
    
    const handleRecommend = () => {
        onRecommend?.({
            id: card.id,
            title: card.title,
            content: card.content,
            category: card.category,
            tags: card.tags,
        });
    };

    const handleSelectRecoResult = (itemId: string) => {
        setSelectedRecoId((prev) => (prev === itemId ? null : itemId));
    };

    const handleSaveIdeaClick = () => {
        if (selectedRecoId === null) return;
        setIsSaveIdeaModalOpen(true);
    };

    // 추천을 아직 안 받은 카드도 추천 결과 없이 바로 아이디어로 저장할 수 있게 함
    const handleSaveIdeaWithoutRecoClick = () => {
        setIsSaveIdeaModalOpen(true);
    };

    // 공개(네) / 비공개(아니오) 버튼을 누르는 것 자체가 공개 여부 선택임
    const handleConfirmSaveIdea = async (isPublic: boolean) => {
        const selected: RecoItem | undefined = card.recoBotResult?.find((item) => item.id === selectedRecoId);
        setIsSaveIdeaModalOpen(false);

        const newIdea = await createMockIdeaFromRecommendation({
            cardTitle: card.title,
            cardContent: card.content,
            category: card.category,
            tags: card.tags,
            recoItem: selected,
            isPublic,
        });

        navigate(`/ideas/${newIdea.id}`);
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

                {/* card.title 표시 */}
                <Title>{card.title}</Title>

                <TagRow>
                    {/* card.tags?.map(tag => <Chip key={tag}>{tag}</Chip>) */}
                    {card.tags?.map((tag) => (
                        <Tag key={tag} variant="hashtag" usage="brainstorm">{tag}</Tag>
                    ))}
                    <Tag variant="hashtag" usage="brainstorm">{card.category}</Tag>
                </TagRow>

                <Content>{card.content}</Content>

                <DateBadge>
                    <DateText>{card.createdAt}</DateText>
                </DateBadge>
            </NoteWrapper>

            <RecoSection>
                {card.recoBotResult === null ? (
                    <>
                        <NoRecoHeaderRow>
                            <RecoSectionLabel>RecoBot의 추천결과</RecoSectionLabel>
                            <RecoActionButton type="button" onClick={handleSaveIdeaWithoutRecoClick}>
                                아이디어로 저장
                            </RecoActionButton>
                        </NoRecoHeaderRow>
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
                    </>
                ) : (
                    <>
                        <RecoHeaderRow>
                            <RecoSectionLabel>RecoBot의 추천결과</RecoSectionLabel>
                            <RecoActionRow>
                                <RecoActionButton type="button" onClick={handleRecommend}>
                                    다시 추천받기
                                </RecoActionButton>
                                <RecoActionButton type="button" disabled={selectedRecoId === null} onClick={handleSaveIdeaClick}>
                                    아이디어로 저장
                                </RecoActionButton>
                            </RecoActionRow>
                        </RecoHeaderRow>

                        <RecoResultList>
                            {card.recoBotResult.map((item) => (
                                <RecoResultCard
                                    key={item.id}
                                    $selected={selectedRecoId === item.id}
                                    onClick={() => handleSelectRecoResult(item.id)}
                                >
                                    <RecoResultTape src={tape} alt="" />
                                    <RecoResultTitle>{item.repoName}</RecoResultTitle>
                                    <RecoResultContent>
                                        {item.description}
                                        <br />
                                        추천 이유: {item.reason}
                                    </RecoResultContent>
                                    <RecoResultTagRow>
                                        <Tag variant="hashtag" usage="brainstorm">★ {formatCount(item.stars)}</Tag>
                                        <Tag variant="hashtag" usage="brainstorm">Fork {formatCount(item.forks)}</Tag>
                                    </RecoResultTagRow>
                                    <RecoResultDateBadge>
                                        <RecoResultDateText>{item.updatedAt}</RecoResultDateText>
                                    </RecoResultDateBadge>
                                </RecoResultCard>
                            ))}
                        </RecoResultList>
                    </>
                )}
            </RecoSection>
        </DetailWrapper>
        <Modal type="confirm" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} message="정말 삭제하시겠어요?"/>
        <Modal
            type="confirm"
            isOpen={isDeleteFailedModalOpen}
            onClose={() => setIsDeleteFailedModalOpen(false)}
            message={'삭제에 실패했어요.\n다시 시도해주세요'}
            cancelText="닫기"
        />
        <CompactModal type="default" size="sm" isOpen={isSaveIdeaModalOpen} onClose={() => setIsSaveIdeaModalOpen(false)}>
            <SaveIdeaModalTitle>이 아이디어를 공개할까요?</SaveIdeaModalTitle>
            <SaveIdeaDescription>
                공개 - 친구들에게 보여요
                <br />
                비공개 - 나만 볼 수 있어요
            </SaveIdeaDescription>
            <SaveIdeaButtonRow>
                <SaveIdeaConfirmButton type="button" onClick={() => handleConfirmSaveIdea(true)}>
                    네
                </SaveIdeaConfirmButton>
                <SaveIdeaCancelButton type="button" onClick={() => handleConfirmSaveIdea(false)}>
                    아니오
                </SaveIdeaCancelButton>
            </SaveIdeaButtonRow>
        </CompactModal>
        </>
    );
}

export default forwardRef(CardDetail);

const Tape = styled.img`
  position: absolute;
  top: -21px;
  left: 324px;
  width: 40px;
  height: 44px;
`;

const DetailWrapper = styled.div`
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding-top: 20px; /* 170 - 150(헤더), 스크롤 컨테이너라 margin 대신 padding 사용 */
  padding-bottom: 40px;
`;

const NoteWrapper = styled.div`
  position: relative;
  width: 744px;
  min-height: 290px; /* 내용이 짧아도 기본 높이는 유지, 길면 자연스럽게 늘어남 */
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

const Title = styled.div`
  font-size: 20px;
  font-weight: ${tokens.fontWeight.regular};
  margin-bottom: 18px;
`;

const TagRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
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
    flex-shrink : 0;
    background: #FFB57D;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom : 40px;
`;

/* 주황 라벨과 버튼 두 개를 한 줄에 나란히 배치 */
const RecoHeaderRow = styled.div`
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 40px;

    ${RecoSectionLabel} {
        margin-bottom: 0;
    }
`;

/* 추천을 아직 안 받은 상태에서도 라벨 옆에 '아이디어로 저장' 버튼을 둘 수 있게 함 */
const NoRecoHeaderRow = styled.div`
    display: flex;
    align-items: center;
    gap: 41px;
    margin-bottom: 40px;

    ${RecoSectionLabel} {
        margin-bottom: 0;
    }
`;

const RecoActionRow = styled.div`
    display: flex;
    gap: 20px;
`;

const RecoActionButton = styled.button`
    height: 26px;
    padding: 0 16px;
    border: 1px solid #E4E4E4;
    border-radius: 7px;
    background: #FFFFFF;
    font-size: 10px;
    font-weight: ${tokens.fontWeight.regular};
    color: ${tokens.colors.text.primary};
    cursor: pointer;

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    &:active:not(:disabled) {
        opacity: 0.6;
    }
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

const RecoResultList = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 196px);
    justify-content: start;
    column-gap: 24px;
    row-gap: 30px;
`;

/* 홈 화면 브레인스토밍 미리보기 카드(BrainstormCardPreview)와 동일한 규격 */
const RecoResultCard = styled.div<{ $selected: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 196px;
    height: 211px;
    box-sizing: border-box;
    background: #FFFD92;
    padding: 35px 10px 10px 12px;
    cursor: pointer;
    box-shadow: ${({ $selected }) => ($selected ? '0px 1px 4px 4px rgba(255, 250, 0, 1)' : 'none')};
`;

const RecoResultTape = styled.img`
    position: absolute;
    left: 78px;
    top: -24px;
`;

const RecoResultTitle = styled.div`
    font-size: 13px;
    font-weight: ${tokens.fontWeight.regular};
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
`;

const RecoResultContent = styled.div`
    font-size: 13px;
    font-weight: ${tokens.fontWeight.light};
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
`;

const RecoResultTagRow = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 20px;
`;

const RecoResultDateBadge = styled.div`
    width: 50px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: auto;
    background: #FFFFFF;
`;

const RecoResultDateText = styled.div`
    font-size: 9px;
    font-weight: ${tokens.fontWeight.regular};
`;

// Modal(size="sm")의 기본 min-height(240px)를 없애서, 내용 높이만큼만 모달이 차지하고
// 네/아니오 버튼이 모달 하단 끝에 바로 붙게 함
const CompactModal = styled(Modal)`
    min-height: auto;
`;

const SaveIdeaModalTitle = styled.p`
    font-size: ${tokens.fontSize.xl};
    font-weight: ${tokens.fontWeight.bold};
    text-align: center;
`;

const SaveIdeaDescription = styled.p`
    margin-top: 24px;
    font-size: ${tokens.fontSize.md};
    font-weight: ${tokens.fontWeight.regular};
    line-height: 1.6;
    text-align: center;
`;

/* Modal(type="confirm")의 네/아니오 버튼과 같은 디자인, padding을 상쇄해서 모달 하단에 꽉 차게 배치 */
const SaveIdeaButtonRow = styled.div`
    margin: 24px -${tokens.spacing[24]} -${tokens.spacing[24]};
    height: 55px;
    display: flex;
`;

const SaveIdeaConfirmButton = styled.button`
    flex: 1;
    border: none;
    font-size: ${tokens.fontSize.xl};
    background-color: #E5E5E5;
    color: ${tokens.colors.text.primary};
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;

const SaveIdeaCancelButton = styled.button`
    flex: 1;
    border: none;
    font-size: ${tokens.fontSize.xl};
    background-color: #444444;
    color: ${tokens.colors.button.white};
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;