import {useParams} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchMockCardDetail } from '@/mocks/brainstormCards';
import RecordForm from '@/features/brainstorm/components/RecordForm';
import type { BrainstormCardDetail } from '@/mocks/brainstormCards';

function EditRecordPage(){
    const{cardId} = useParams();
    const [card, setCard] = useState<BrainstormCardDetail | null>(null);

    useEffect(() => {
        if(!cardId) return;
        fetchMockCardDetail(cardId).then(setCard);
    }, [cardId]);

    if(!card) return <div>로딩중...</div>

    //데이터가 다 로드된 후에만 도달하는 코드. RecordForm을 렌더링하면서 세 가지를 넘겨줌
    return <RecordForm mode="edit" cardId={cardId} initialData={card} />;
}
export default EditRecordPage;
