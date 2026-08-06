import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

import { tokens } from '@/styles/tokens';
import IconButton from '@/components/common/IconButton';
import Modal from '@/components/common/Modal';
import filterIcon from '@/assets/filter.svg';
import recobotIcon from '@/assets/recobot.svg';
import type { RecommendationSortOption } from '@/mocks/recobot';
import {
  deleteMockRecommendationsForCard,
  fetchMockRecommendations,
  requestMockRecommendation,
  saveMockRecommendationAsIdea,
  toRecoItem,
} from '@/mocks/recobot';
import { appendMockRecoResult } from '@/mocks/brainstormCards';
import { createMockIdeaFromRecommendation } from '@/mocks/ideaCards';
import type { AttachedCard, ResultItem } from '@/store/recoBotSessionStore';
import { useRecoBotSessionStore } from '@/store/recoBotSessionStore';

export interface RecoBotPanelHandle {
  // 기록 상세 화면의 "추천받기" 버튼처럼, 드래그 없이 카드 하나를 바로 요청 보낼 때 사용
  requestRecommendation: (card: AttachedCard) => void;
}

interface RecoBotPanelProps {
  // "취소" → 추천 내역 보관 확정 시, 부모가 카드 상세 화면을 새로고침할 수 있게 알려줌
  onSaved?: () => void;
}

const SORT_OPTIONS: { value: RecommendationSortOption; label: string }[] = [
  { value: 'star', label: 'stars 높은 순' },
  { value: 'fork', label: 'fork 낮은 순' },
  { value: 'latest', label: '최근 업데이트 순' },
];

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

const truncateContent = (text: string, maxLength = 80) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

function RecoBotPanel({ onSaved }: RecoBotPanelProps, ref: React.ForwardedRef<RecoBotPanelHandle>) {
  const navigate = useNavigate();

  // 페이지를 이동해도(다른 카드 상세로 넘어가는 등) 진행 중이던 추천 세션이 유지되도록
  // 이 부분들은 컴포넌트 local state가 아니라 전역 store에서 가져옴
  const attachedCard = useRecoBotSessionStore((s) => s.attachedCard);
  const setAttachedCard = useRecoBotSessionStore((s) => s.setAttachedCard);
  const sentCard = useRecoBotSessionStore((s) => s.sentCard);
  const setSentCard = useRecoBotSessionStore((s) => s.setSentCard);
  const panelState = useRecoBotSessionStore((s) => s.panelState);
  const setPanelState = useRecoBotSessionStore((s) => s.setPanelState);
  const selectedRecommendationId = useRecoBotSessionStore((s) => s.selectedRecommendationId);
  const setSelectedRecommendationId = useRecoBotSessionStore((s) => s.setSelectedRecommendationId);
  const selectedSort = useRecoBotSessionStore((s) => s.selectedSort);
  const setSelectedSort = useRecoBotSessionStore((s) => s.setSelectedSort);
  const resetSession = useRecoBotSessionStore((s) => s.resetSession);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRequestingMore, setIsRequestingMore] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelWarning, setCancelWarning] = useState(false);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // 패널 내부 자식 엘리먼트 사이를 오갈 때도 dragenter/dragleave가 계속 발생하므로,
  // 카운터로 세어서 패널을 완전히 벗어났을 때만 isDragOver를 꺼줌 (깜빡임 방지)
  const dragCounter = useRef(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  // 취소 후에도 늦게 도착하는 이전 요청 결과를 무시하기 위한 시퀀스 번호
  const requestSeqRef = useRef(0);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (popoverRef.current?.contains(target)) return;
      // 필터 토글 버튼 자체 클릭은 버튼의 onClick이 처리하므로 여기서는 무시
      if (target.closest('[aria-label="필터"]')) return;
      setIsFilterOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isFilterOpen]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);

    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const card = JSON.parse(data);
    setAttachedCard({
      id: card.id,
      title: card.title,
      content: card.content,
      category: card.category,
      tags: card.tags,
    });
  };

  const handleRemoveCard = () => {
    setAttachedCard(null);
  };

  const handleToggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const loadResultList = async (
    cardId: string,
    sort: RecommendationSortOption | null,
  ): Promise<ResultItem[]> => {
    const list = await fetchMockRecommendations(cardId, sort ?? undefined);
    const items: ResultItem[] = [];
    for (const r of list) {
      if (r.repositories && r.repositories[0]) {
        items.push({ recommendationId: r.recommendationId, repository: r.repositories[0] });
      }
    }
    return items;
  };

  const handleSelectSort = (option: RecommendationSortOption) => {
    const next = selectedSort === option ? null : option;
    setSelectedSort(next);

    if (sentCard && panelState.phase === 'result') {
      loadResultList(sentCard.id, next).then((items) => setPanelState({ phase: 'result', items }));
    }
  };

  const handleResetSort = () => {
    setSelectedSort(null);

    if (sentCard && panelState.phase === 'result') {
      loadResultList(sentCard.id, null).then((items) => setPanelState({ phase: 'result', items }));
    }
  };

  // 처음 보내기(sending 상태로 전환)와 "다시 추천받기"(기존 목록 유지하며 1개 추가)를 함께 처리
  const requestForCard = async (card: AttachedCard) => {
    const isAppending = panelState.phase === 'result' && sentCard?.id === card.id;

    if (isAppending) {
      if (isRequestingMore) return;
      setIsRequestingMore(true);
    } else {
      setAttachedCard(null);
      setSentCard(card);
      setPanelState({ phase: 'sending' });
      setSelectedRecommendationId(null);
    }

    const requestId = ++requestSeqRef.current;

    try {
      await requestMockRecommendation(card.id, card.title, card.content);
      if (requestSeqRef.current !== requestId) return;

      const items = await loadResultList(card.id, selectedSort);
      if (requestSeqRef.current !== requestId) return;

      setPanelState({ phase: 'result', items });
    } catch (err) {
      if (requestSeqRef.current !== requestId) return;
      if (!isAppending) {
        const message = (err as { message?: string })?.message ?? '추천을 가져오지 못했어요.';
        setPanelState({ phase: 'error', message });
      }
    } finally {
      if (requestSeqRef.current === requestId) setIsRequestingMore(false);
    }
  };

  const handleSend = () => {
    if (!attachedCard || panelState.phase === 'sending') return;
    requestForCard(attachedCard);
  };

  const handleRequestAgain = () => {
    if (!sentCard) return;
    requestForCard(sentCard);
  };

  useImperativeHandle(ref, () => ({
    requestRecommendation: (card: AttachedCard) => {
      requestForCard(card);
    },
  }));

  const handleSelectResult = (recommendationId: number) => {
    setSelectedRecommendationId(selectedRecommendationId === recommendationId ? null : recommendationId);
  };

  const resetPanel = () => {
    resetSession();
  };

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelModal = async () => {
    if (selectedRecommendationId === null) {
      setIsCancelModalOpen(false);
      setCancelWarning(true);
      setTimeout(() => setCancelWarning(false), 2500);
      return; // 선택 안 했으면 패널은 그대로 두고 사용자가 다시 골라야 함
    }

    const items = panelState.phase === 'result' ? panelState.items : [];
    const selected = items.find((i) => i.recommendationId === selectedRecommendationId);
    setIsCancelModalOpen(false);

    if (selected && sentCard) {
      await appendMockRecoResult(sentCard.id, toRecoItem(selected.repository));
      onSaved?.();
    }

    resetPanel();
  };

  const handleDeclineCancelModal = async () => {
    setIsCancelModalOpen(false);

    // 보관 안 하기로 했으면, 이번 세션에서 만든 추천 기록 자체를 지워서
    // 같은 카드로 다시 보냈을 때 예전 추천들이 다시 나타나지 않게 함
    if (sentCard) {
      await deleteMockRecommendationsForCard(sentCard.id);
    }

    resetPanel();
  };

  const handleSaveIdeaClick = () => {
    if (selectedRecommendationId === null) return;
    setIsSaveModalOpen(true);
  };

  // 공개(네) / 비공개(아니오) 버튼을 누르는 것 자체가 공개 여부 선택임
  const handleConfirmSaveIdea = async (isPublic: boolean) => {
    if (selectedRecommendationId === null || !sentCard) return;

    const items = panelState.phase === 'result' ? panelState.items : [];
    const selected = items.find((i) => i.recommendationId === selectedRecommendationId);
    if (!selected) return;

    await saveMockRecommendationAsIdea(selectedRecommendationId, isPublic ? 'PUBLIC' : 'PRIVATE');

    const newIdea = await createMockIdeaFromRecommendation({
      cardTitle: sentCard.title,
      cardContent: sentCard.content,
      category: sentCard.category ?? '기타',
      tags: sentCard.tags,
      recoItem: toRecoItem(selected.repository),
      isPublic,
    });

    setIsSaveModalOpen(false);
    resetPanel();
    navigate(`/ideas/${newIdea.id}`);
  };

  return (
    <Wrapper
      $isDragOver={isDragOver}
      $isFilterOpen={isFilterOpen}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <HeaderArea>
        <Header>
          <IconButton size="lg" icon={<img src={filterIcon} alt="" />} ariaLabel="필터" onClick={handleToggleFilter} />
          <Brand>
            <img src={recobotIcon} alt="" width={20} height={20} />
            <BrandName>RecoBot</BrandName>
          </Brand>
          {/* 필터 버튼과 대칭 맞춰서 Brand를 중앙 정렬시키기 위한 빈 칸 */}
          <HeaderSpacer aria-hidden="true" />
        </Header>

        {isFilterOpen && (
          <FilterPopover ref={popoverRef}>
            <FilterTopRow>
              <CloseButton type="button" aria-label="필터 닫기" onClick={() => setIsFilterOpen(false)}>
                ×
              </CloseButton>
              <FilterTitle>정렬 필터</FilterTitle>
              <ResetButton type="button" onClick={handleResetSort}>
                전체 초기화
              </ResetButton>
            </FilterTopRow>

            <FilterBody>
              <ChipRow>
                {SORT_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    type="button"
                    $selected={selectedSort === option.value}
                    onClick={() => handleSelectSort(option.value)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </ChipRow>
            </FilterBody>
          </FilterPopover>
        )}
      </HeaderArea>

      <Body>
        {panelState.phase === 'idle' && (
          <CenteredMessage>
            <EmptyText>아이디어가 있으신가요? RecoBot이 도와드릴게요</EmptyText>
          </CenteredMessage>
        )}

        {sentCard && panelState.phase !== 'idle' && (
          <SentCardBubble>
            <SentCardTitle>{sentCard.title}</SentCardTitle>
            <SentCardContent>{truncateContent(sentCard.content)}</SentCardContent>
          </SentCardBubble>
        )}

        {panelState.phase === 'sending' && (
          <LoadingDots aria-label="추천 생성 중">
            <Dot $delay={0} />
            <Dot $delay={0.15} />
            <Dot $delay={0.3} />
          </LoadingDots>
        )}

        {panelState.phase === 'error' && <ErrorText>{panelState.message}</ErrorText>}

        {panelState.phase === 'result' && (
          <>
            <ButtonRow>
              <ActionButton type="button" disabled={selectedRecommendationId === null} onClick={handleSaveIdeaClick}>
                아이디어로 저장
              </ActionButton>
              <ActionButton type="button" disabled={isRequestingMore} onClick={handleRequestAgain}>
                ↻ 다시 추천받기
              </ActionButton>
              <CancelActionButton type="button" onClick={handleCancelClick}>
                취소
              </CancelActionButton>
            </ButtonRow>

            {cancelWarning && <WarningText>아직 레포를 선택하지 않았어요</WarningText>}

            <Divider />

            <ResultList>
              {panelState.items.map((item) => (
                <RepoCard
                  key={item.recommendationId}
                  $selected={selectedRecommendationId === item.recommendationId}
                  onClick={() => handleSelectResult(item.recommendationId)}
                >
                  <RepoName>{item.repository.name}</RepoName>
                  <RepoStats>
                    ★ {formatCount(item.repository.starCount)} · Fork {formatCount(item.repository.forkCount)}
                  </RepoStats>
                  <RepoDescription>{item.repository.description}</RepoDescription>
                  <RepoReason>추천 이유: {item.repository.reason}</RepoReason>
                  <RepoLink
                    href={item.repository.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↗ Github에서 보기
                  </RepoLink>
                </RepoCard>
              ))}
            </ResultList>
          </>
        )}
      </Body>

      <Footer>
        <InputBox $isDragOver={isDragOver}>
          {attachedCard ? (
            <AttachedRow>
              <MiniCard>
                <RemoveButton type="button" aria-label="첨부 취소" onClick={handleRemoveCard}>
                  ×
                </RemoveButton>
              </MiniCard>
              <AttachedText>제목 : &apos;{attachedCard.title}&apos;</AttachedText>
            </AttachedRow>
          ) : (
            <PlaceholderText>브레인스토밍 카드를 여기에 드래그하세요</PlaceholderText>
          )}

          <SendButton
            type="button"
            aria-label="전송"
            disabled={!attachedCard || panelState.phase === 'sending'}
            onClick={handleSend}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 13V6M3.5 7.5L8 3L12.5 7.5"
                stroke="#313131"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SendButton>
        </InputBox>
      </Footer>

      <Modal
        type="confirm"
        isOpen={isCancelModalOpen}
        onClose={handleDeclineCancelModal}
        onConfirm={handleConfirmCancelModal}
        message="추천 내역을 보관할까요?"
      />

      <CompactModal type="default" size="sm" isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
        <SaveModalTitle>이 아이디어를 공개할까요?</SaveModalTitle>
        <SaveModalDescription>
          공개 - 친구들에게 보여요
          <br />
          비공개 - 나만 볼 수 있어요
        </SaveModalDescription>
        <SaveModalButtonRow>
          <SaveModalConfirmButton type="button" onClick={() => handleConfirmSaveIdea(true)}>
            네
          </SaveModalConfirmButton>
          <SaveModalCancelButton type="button" onClick={() => handleConfirmSaveIdea(false)}>
            아니오
          </SaveModalCancelButton>
        </SaveModalButtonRow>
      </CompactModal>
    </Wrapper>
  );
}

export default forwardRef(RecoBotPanel);

const Wrapper = styled.div<{ $isDragOver: boolean; $isFilterOpen: boolean }>`
  height: calc(100% - 20px);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  background: ${({ $isFilterOpen }) => ($isFilterOpen ? '#F8F8F8' : '#FFFFFF')};
  border: 1px solid ${({ $isDragOver }) => ($isDragOver ? '#B0B0B0' : tokens.colors.border.primary)};
  border-radius: 16px;
  box-sizing: border-box;
  overflow: hidden;
`;

const HeaderArea = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: ${tokens.spacing[20]} ${tokens.spacing[24]};
`;

const HeaderSpacer = styled.span``;

const FilterPopover = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 315px;
  height: 115px;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 20;
  display: flex;
  flex-direction: column;
`;

const FilterTopRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 14px 16px;
  border-bottom: 1px solid ${tokens.colors.border.primary};
`;

const CloseButton = styled.button`
  position: absolute;
  left: 16px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 22px;
  color: #000000;
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

const FilterTitle = styled.span`
  font-size: ${tokens.fontSize.md};
  font-weight: ${tokens.fontWeight.medium};
`;

const ResetButton = styled.button`
  position: absolute;
  right: 16px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 9px;
  font-weight: ${tokens.fontWeight.regular};
  color: #696969;
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

const FilterBody = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 16px;
`;

const Chip = styled.button<{ $selected: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: 9999px;
  background: ${({ $selected }) => ($selected ? '#434343' : '#EBEBEB')};
  color: ${({ $selected }) => ($selected ? '#FFFFFF' : '#434343')};
  font-size: 9px;
  font-weight: ${tokens.fontWeight.regular};
  white-space: nowrap;
  cursor: pointer;

  &:active {
    opacity: 0.8;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[8]};
  justify-self: center;
`;

const BrandName = styled.span`
  font-size: ${tokens.fontSize.xl};
  font-weight: ${tokens.fontWeight.regular};
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: ${tokens.spacing[16]} 26px;
`;

const CenteredMessage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 ${tokens.spacing[8]};
  text-align: center;
`;

const EmptyText = styled.p`
  font-size: 13px;
  font-weight: ${tokens.fontWeight.light};
  color: ${tokens.colors.text.light};
`;

const ErrorText = styled.p`
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  font-weight: ${tokens.fontWeight.light};
  color: ${tokens.colors.text.error};
`;

const SentCardBubble = styled.div`
  flex-shrink: 0;
  align-self: flex-end; /* 사용자가 보낸 메시지처럼 우측 정렬 (패널 우측 끝단으로부터 26px, Body의 padding으로 확보) */
  width: 214px;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 0;
  background: #fffd92;
`;

const SentCardTitle = styled.div`
  font-size: ${tokens.fontSize.lg};
  font-weight: ${tokens.fontWeight.medium};
`;

const SentCardContent = styled.div`
  margin-top: 6px;
  font-size: ${tokens.fontSize.md};
  font-weight: ${tokens.fontWeight.regular};
  white-space: pre-wrap;
`;

const bounce = keyframes`
  0%, 80%, 100% { opacity: 0.25; }
  40% { opacity: 1; }
`;

const LoadingDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
`;

const Dot = styled.span<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #000000;
  animation: ${bounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 22px;
`;

const ActionButton = styled.button`
  flex: 1;
  height: 22px;
  padding: 0;
  border: 1px solid #e4e4e4;
  border-radius: 7px;
  background: #ffffff;
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

const CancelActionButton = styled(ActionButton)`
  flex: none;
  width: 40px;
  color: ${tokens.colors.text.error};
`;

const WarningText = styled.p`
  margin-top: 8px;
  text-align: center;
  font-size: 11px;
  color: ${tokens.colors.text.error};
`;

const Divider = styled.div`
  margin-top: 22px;
  border-top: 1px solid ${tokens.colors.border.primary};
`;

const ResultList = styled.div`
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RepoCard = styled.div<{ $selected: boolean }>`
  padding: 14px;
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: 10px;
  cursor: pointer;
  box-shadow: ${({ $selected }) => ($selected ? '0px 1px 4px 2px rgba(255, 250, 0, 0.8)' : 'none')};
`;

const RepoName = styled.div`
  font-size: ${tokens.fontSize.md};
  font-weight: ${tokens.fontWeight.medium};
`;

const RepoStats = styled.div`
  margin-top: 4px;
  font-size: 10px;
  font-weight: ${tokens.fontWeight.regular};
  color: ${tokens.colors.text.extraLight};
`;

const RepoDescription = styled.div`
  margin-top: 8px;
  font-size: 11px;
  font-weight: ${tokens.fontWeight.regular};
  color: ${tokens.colors.text.light};
`;

const RepoReason = styled.div`
  margin-top: 6px;
  font-size: 11px;
  font-weight: ${tokens.fontWeight.regular};
  color: ${tokens.colors.text.extraLight};
`;

const RepoLink = styled.a`
  display: inline-block;
  margin-top: 10px;
  font-size: 11px;
  color: #4a90d9;
  text-decoration: none;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  padding: 12px;
`;

const InputBox = styled.div<{ $isDragOver: boolean }>`
  position: relative;
  flex: 1;
  max-width: 312px;
  min-height: 48px;
  box-sizing: border-box;
  border-radius: 10px;
  background: ${({ $isDragOver }) => ($isDragOver ? '#DADADA' : '#E8E8E8')};
  display: flex;
  align-items: center;
  padding: 8px 43px 8px 12px;
`;

const PlaceholderText = styled.span`
  font-size: ${tokens.fontSize.md};
  font-weight: ${tokens.fontWeight.regular};
  color: ${tokens.colors.text.light};
`;

const AttachedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const MiniCard = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 68px;
  height: 73px;
  border-radius: 6px;
  background: ${tokens.colors.category.contentMedia};
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -6px;
  left: -6px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  color: #313131;
  font-size: 11px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

const AttachedText = styled.span`
  font-size: ${tokens.fontSize.md};
  font-weight: ${tokens.fontWeight.regular};
  color: ${tokens.colors.text.light};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const SendButton = styled.button`
  position: absolute;
  right: 8px;
  bottom: 8px;
  flex-shrink: 0;
  width: 31px;
  height: 31px;
  border-radius: 50%;
  border: 1px solid ${tokens.colors.border.primary};
  background: #fdfdfd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    opacity: 0.6;
  }
`;

// Modal(size="sm")의 기본 min-height(240px)를 없애서, 내용 높이만큼만 모달이 차지하고
// 네/아니오 버튼이 모달 하단 끝에 바로 붙게 함
const CompactModal = styled(Modal)`
  min-height: auto;
`;

const SaveModalTitle = styled.p`
  font-size: ${tokens.fontSize.lg};
  font-weight: ${tokens.fontWeight.bold};
  text-align: center;
`;

const SaveModalDescription = styled.p`
  margin-top: 24px;
  font-size: ${tokens.fontSize.md};
  font-weight: ${tokens.fontWeight.regular};
  line-height: 1.6;
  text-align: center;
`;

/* Modal(type="confirm")의 네/아니오 버튼과 같은 디자인, padding을 상쇄해서 모달 하단에 꽉 차게 배치 */
const SaveModalButtonRow = styled.div`
  margin: 24px -${tokens.spacing[24]} -${tokens.spacing[24]};
  height: 55px;
  display: flex;
`;

const SaveModalConfirmButton = styled.button`
  flex: 1;
  border: none;
  font-size: ${tokens.fontSize.xl};
  background-color: #e5e5e5;
  color: ${tokens.colors.text.primary};
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

const SaveModalCancelButton = styled.button`
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
