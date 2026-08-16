import { useState } from 'react';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import { useCardColorSettingStore } from '@/store/cardColorSettingStore';
import closeIcon from '@/assets/closeButton.svg';
import circleRightIcon from '@/assets/circle_right.svg';
import circleLeftIcon from '@/assets/circle_left.svg';
import tape from '@/assets/tape.svg';

interface CategoryColor {
    label : string;
    color : string;
}

const CATEGORY_COLORS : CategoryColor[] = [
    { label : '콘텐츠/미디어', color : tokens.colors.category.contentMedia },
    { label : '생활', color : tokens.colors.category.lifestyle },
    { label : '건강', color : tokens.colors.category.health },
    { label : '업무/도구', color : tokens.colors.category.workTool },
    { label : '개발/디자인', color : tokens.colors.category.developmentDesign },
    { label : '사람', color : tokens.colors.category.people },
    { label : '기타', color : tokens.colors.category.other },
];

const PAGE_SIZE = 3;
const PAGE_COUNT = Math.ceil(CATEGORY_COLORS.length / PAGE_SIZE);

interface CardColorModalProps {
    isOpen : boolean;
    onClose : () => void;
}

function CardColorModal({ isOpen, onClose } : CardColorModalProps) {
    const isCategoryColorEnabled = useCardColorSettingStore((state) => state.isCategoryColorEnabled);
    const setIsCategoryColorEnabled = useCardColorSettingStore((state) => state.setIsCategoryColorEnabled);

    const [page, setPage] = useState(0);

    if (!isOpen) return null;

    const previewColors = CATEGORY_COLORS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const handleNextPage = () => {
        setPage((prev) => Math.min(prev + 1, PAGE_COUNT - 1));
    };

    const handlePrevPage = () => {
        setPage((prev) => Math.max(prev - 1, 0));
    };

    return (
        <Overlay onClick={onClose}>
            <Box onClick={(e) => e.stopPropagation()}>
                <CloseButton type="button" onClick={onClose} aria-label="닫기">
                    <img src={closeIcon} alt="" />
                </CloseButton>

                <Sidebar>
                    <SidebarTitle>카테고리 색상</SidebarTitle>
                    <SidebarDivider />
                    <ChipList>
                        {CATEGORY_COLORS.map((category) => (
                            <CategoryChip key={category.label} $color={category.color}>
                                {category.label}
                            </CategoryChip>
                        ))}
                    </ChipList>
                </Sidebar>

                <Main>
                    <Title>카드에 배경색 적용하기</Title>

                    <ToggleRow>
                        <ToggleLabel>브레인스토밍 카드 배경에 카테고리 색상을 반영해요</ToggleLabel>
                        <Toggle
                            type="button"
                            role="switch"
                            aria-checked={isCategoryColorEnabled}
                            $checked={isCategoryColorEnabled}
                            onClick={() => setIsCategoryColorEnabled(!isCategoryColorEnabled)}
                        >
                            <ToggleThumb $checked={isCategoryColorEnabled} />
                        </Toggle>
                    </ToggleRow>

                    <PreviewLabel>preview</PreviewLabel>

                    <PreviewRow>
                        {previewColors.map((category) => (
                            <PreviewCard
                                key={category.label}
                                $color={category.color}
                            >
                                <PreviewTape src={tape} alt="" />
                                <PreviewDots>
                                    <PreviewDot />
                                    <PreviewDot />
                                    <PreviewDot />
                                </PreviewDots>
                                <PreviewDateBadge>
                                    <PreviewDateText>2026.05.24</PreviewDateText>
                                </PreviewDateBadge>
                            </PreviewCard>
                        ))}
                    </PreviewRow>
                </Main>

                {page > 0 && (
                    <PrevPageButton type="button" onClick={handlePrevPage} aria-label="이전 컬러 버전 보기">
                        <img src={circleLeftIcon} alt="" />
                    </PrevPageButton>
                )}

                {page < PAGE_COUNT - 1 && (
                    <NextPageButton type="button" onClick={handleNextPage} aria-label="다른 컬러 버전 보기">
                        <img src={circleRightIcon} alt="" />
                    </NextPageButton>
                )}
            </Box>
        </Overlay>
    );
}

export default CardColorModal;

const Overlay = styled.div`
    position : fixed;
    top : 0;
    left : 0;
    width : 100%;
    height : 100%;
    background : rgba(0, 0, 0, 0.3);
    display : flex;
    align-items : center;
    justify-content : center;
    z-index : 1000;
`;

const Box = styled.div`
    position : relative;
    width : 670px;
    height : 392px;
    box-sizing : border-box;
    background : #FFFFFF;
    border-radius : 16px;
    display : flex;
    align-items : flex-start;
    gap : 40px;
    box-shadow : 0px 4px 20px rgba(0, 0, 0, 0.15);
`;

const CloseButton = styled.button`
    position : absolute;
    top : 20px;
    right : 20px;
    width : 28px;
    height : 28px;
    border : none;
    background : none;
    padding : 0;
    cursor : pointer;
    display : flex;
    align-items : center;
    justify-content : center;

    img {
        width : 20px;
        height : 20px;
    }
`;

const Sidebar = styled.div`
    flex-shrink : 0;
    width : 130px;
    margin-top : 60px;
    margin-left : 63px;
`;

const SidebarTitle = styled.div`
    width : 110px;
    text-align : center;
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.medium};
`;

const SidebarDivider = styled.div`
    width : 110px;
    height : 1px;
    margin-top : 15px;
    background : ${tokens.colors.border.primary};
`;

const ChipList = styled.div`
    margin-top : 20px;
    display : flex;
    flex-direction : column;
    gap : 10px;
`;

const CategoryChip = styled.div<{ $color : string }>`
    width : fit-content;
    padding : 5px 12px;
    border-radius : 9999px;
    background : ${({ $color }) => $color};
    font-size : 7px;
    font-weight : ${tokens.fontWeight.light};
    color : ${tokens.colors.text.primary};
`;

const Main = styled.div`
    flex-shrink : 0;
    width : 370px;
    margin-top : 60px;
    display : flex;
    flex-direction : column;
    align-items : center;
`;

const Title = styled.div`
    font-size : ${tokens.fontSize.xl};
    font-weight : ${tokens.fontWeight.semibold};
`;

const ToggleRow = styled.div`
    margin-top : 24px;
    display : flex;
    align-items : center;
    gap : 12px;
`;

const ToggleLabel = styled.div`
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
`;

const Toggle = styled.button<{ $checked : boolean }>`
    width : 34px;
    height : 18px;
    box-sizing : border-box;
    border : none;
    border-radius : 9999px;
    padding : 2px;
    background : ${({ $checked }) => ($checked ? '#515151' : '#D1D1D6')};
    cursor : pointer;
    display : flex;
    align-items : center;
    justify-content : ${({ $checked }) => ($checked ? 'flex-end' : 'flex-start')};
`;

const ToggleThumb = styled.div<{ $checked : boolean }>`
    width : 14px;
    height : 14px;
    border-radius : 50%;
    background : #FFFFFF;
`;

const PreviewLabel = styled.div`
    margin-top : 32px;
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
    color : ${tokens.colors.text.primary};
`;

const PreviewRow = styled.div`
    align-self : stretch;
    margin-top : 28px;
    display : flex;
    justify-content : flex-start;
    align-items : center;
    gap : 20px;
`;

const PreviewCard = styled.div<{ $color : string }>`
    position : relative;
    width : 110px;
    height : 118px;
    box-sizing : border-box;
    background : ${({ $color }) => $color};
    padding : 20px 8px 8px 8px;
`;

const PreviewTape = styled.img`
    position : absolute;
    left : 44px;
    top : -13px;
    width : 22px;
`;

const PreviewDots = styled.div`
    position : absolute;
    top : 4px;
    left : 4px;
    display : flex;
    gap : 2px;
`;

const PreviewDot = styled.div`
    width : 3px;
    height : 3px;
    box-sizing : border-box;
    border : 0.6px solid #FF1313;
    border-radius : 50%;
    background : #FF1313;
`;

const PreviewDateBadge = styled.div`
    position : absolute;
    bottom : 8px;
    left : 8px;
    width : 34px;
    height : 9px;
    display : flex;
    align-items : center;
    justify-content : center;
    background : #FFFFFF;
`;

const PreviewDateText = styled.div`
    font-size : 6px;
    font-weight : ${tokens.fontWeight.regular};
`;

const PageButtonBase = `
    position : absolute;
    top : 256px;
    transform : translateY(-50%);
    width : 24px;
    height : 24px;
    border : none;
    background : none;
    padding : 0;
    cursor : pointer;
    display : flex;
    align-items : center;
    justify-content : center;

    img {
        width : 100%;
        height : 100%;
    }

    &:active {
        opacity : 0.6;
    }
`;

const PrevPageButton = styled.button`
    ${PageButtonBase}
    left : 189px;
`;

const NextPageButton = styled.button`
    ${PageButtonBase}
    right : 23px;
`;
