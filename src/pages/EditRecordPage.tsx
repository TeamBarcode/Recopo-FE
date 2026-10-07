import {useNavigate, useParams} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchMockCardDetail } from '@/mocks/brainstormCards';
import RecordForm from '@/features/brainstorm/components/RecordForm';
import type { BrainstormCardDetail } from '@/mocks/brainstormCards';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';

function EditRecordPage(){
    const{cardId} = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState<BrainstormCardDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(!cardId) return;
        fetchMockCardDetail(cardId)
            .then((data) => {
                setError(null);
                setCard(data);
            })
            .catch((err) => setError(err?.message ?? '카드를 불러오지 못했어요'));
    }, [cardId]);

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

    if(!card) return <Loading />

    //데이터가 다 로드된 후에만 도달하는 코드. RecordForm을 렌더링하면서 세 가지를 넘겨줌
    return <RecordForm mode="edit" cardId={cardId} initialData={card} />;
}
export default EditRecordPage;
