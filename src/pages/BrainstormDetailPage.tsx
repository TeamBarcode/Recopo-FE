import { useRef } from 'react';
import CardDetail from '@/features/brainstorm/components/CardDetail';
import type { CardDetailHandle } from '@/features/brainstorm/components/CardDetail';
import RecoBotPanel from '@/features/recobot/components/RecoBotPanel';
import type { RecoBotPanelHandle } from '@/features/recobot/components/RecoBotPanel';
import styled from 'styled-components';

function BrainstormDetailPage() {
    const recoBotPanelRef = useRef<RecoBotPanelHandle>(null);
    const cardDetailRef = useRef<CardDetailHandle>(null);

    return (
        <DetailGrid>
            <CardDetail
                ref={cardDetailRef}
                onRecommend={(card) => recoBotPanelRef.current?.requestRecommendation(card)}
            />
            <RecoBotPanel ref={recoBotPanelRef} onSaved={() => cardDetailRef.current?.refetch()} />
        </DetailGrid>
    );
}

export default BrainstormDetailPage;

//HomePage랑 똑같이
const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 350px;
    column-gap: 33px;
    margin-right: -68px;
    height: calc(100vh - 150px);
    overflow: hidden;

    @media (max-width: 1200px) {
        margin-right: -36px;
    }

    @media (max-width: 900px) {
        margin-right: -12px;
    }
`;