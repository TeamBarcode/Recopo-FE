import CardDetail from '@/features/brainstorm/components/CardDetail';
import RecoBotPanel from '@/features/recobot/components/RecoBotPanel';
import styled from 'styled-components';

function BrainstormDetailPage() {
    return (
        <DetailGrid>
            <CardDetail />
            <RecoBotPanel />
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