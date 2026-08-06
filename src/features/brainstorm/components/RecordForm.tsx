import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import { useRef, useEffect } from 'react';

import {tokens} from '@/styles/tokens';
import Dropdown from '@/components/common/Dropdown';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { createMockBrainstormCard, UpdateMockBrainstormCard } from '@/mocks/brainstormCards';
import tape from '@/assets/tape.svg';
import type {BrainstormCard} from '@/mocks/brainstormCards';

const CATEGORY_OPTIONS = [
  '콘텐츠/미디어', '생활', '건강', '업무/도구', '개발/디자인', '사람', '기타',
];

interface RecordFormProps {
    mode? : 'create' | 'edit';
    cardId? : string;
    initialData? : BrainstormCard;
}
//mode(생성인지 수정인지), cardId(수정할 카드 아이디), initalData(기존 카드 값)을 부모(RecordPage or EditRecordPage)한테서 받을 수 있게 함.

function RecordForm({mode = 'create', cardId, initialData} : RecordFormProps) {
    const[title, setTitle] = useState(initialData?.title ?? '');
    //initialData가 있으면 title 값으로 시작하고 없으면 빈 문자열로 시작 -> edit 모드면 입력창이 미리 채워져있음
    const[content, setContent] = useState(initialData?.content ?? '');
    const[category, setCategory] = useState(initialData?.category ?? '');

    const navigate = useNavigate();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if(textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            // 일단 height를 auto로 리셋 → scrollHeight가 "줄어들 때"도 정확하게 계산되게 함
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            // 리셋된 상태에서 실제 필요한 높이(scrollHeight) 읽어서 그대로 적용
        }
    }, [content]); // content가 바뀔 때마다(=타이핑할 때마다) 이 effect 다시 실행됨

    const handleSubmit = async() => {
        // 1) content 문자열에서 #태그 뽑기
        const extractedTags = content.match(/#[^\s#]+/g) ?? [];
        // content가 "todo 앱 #React #공부" 라면 → extractedTags는 ["#React", "#공부"]
        // 만약 #이 하나도 없으면 match()가 null을 주니까 ?? []로 빈 배열 처리

        //저장버튼 눌렀을 때 새 카드 생성인지 수정인지에 따라 다른 mock 함수 호출
        if(mode === 'edit' && cardId){
            await UpdateMockBrainstormCard(cardId, {title, content, category, tags: extractedTags});
            navigate(`/brainstorm/${cardId}`);
        }else {
            // 2) mock 서버(가짜 API)한테 카드 생성 요청 보내고, 응답 기다리기
            const newCard = await createMockBrainstormCard({
                title, content, category, tags: extractedTags,
            });
            // await가 있어서 여기서 500ms 동안 멈춰있다가 서버가 만들어준 완성된 카드(id 포함)를 newCard에 받음

            // 3) 방금 만든 카드의 id로 상세 페이지 이동
            navigate(`/brainstorm/${newCard.id}`);
        }
    };

    return(
        <NoteWrapper>
            <Tape src={tape} alt="" />
            <StatusDot />
            <RightControls>
                <Dropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} size="md" placeholder="카테고리" />
                <SaveButton variant="primary" onClick={handleSubmit}>저장하기</SaveButton>
            </RightControls>
            
            <TitleInput size="lg" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
            <ContentTextArea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" />
        </NoteWrapper>
    );
}

export default RecordForm;

const NoteWrapper = styled.div`
    position : relative;
    width : 744px;
    min-height : 673px;
    padding : 17px 37px 51px 35px;
    margin : 14px auto 0;
    display : flex;
    flex-direction : column;
    background : #FFFD92;
    box-shadow : 0px 3px 3px rgba(0,0,0,0.25);
`;
/* 
height는 따로 안 정함 — 내용 늘어나면 min-height 넘어서 자연스럽게 커짐 
margin: 0 auto 추가 → 페이지 안에서 좌우 중앙 정렬
*/

const Tape = styled.img`
    position : absolute;
    top : -18px;
    left : 344px;
`;

const StatusDot = styled.div`
    position : absolute;
    top : 17px;
    left : 22px;
    width: 5px;
    height : 5px;
    border-radius: 50%;
    background: #FF1313;
`;

const RightControls = styled.div`
    display : flex;
    align-items : center;
    justify-content : flex-end;
    gap : 11px;
    margin-bottom : 20px;
`;

const SaveButton = styled(Button)`
  border: none;
`;

const TitleInput = styled(Input)`
  margin-bottom: 25px;
  padding-left: 0;
`;
//padding-left: 0 추가 → Input.tsx의 기본 좌측 패딩(16px) 제거해서 ContentTextarea와 왼쪽 정렬 맞춤

const ContentTextArea = styled.textarea`
    width : 672px;
    min-height : 502px;
    font-size : 15px;
    overflow: hidden;
    resize : none;
    border : none;
    background : transparent;

    &::placeholder {
    color: ${tokens.colors.text.placeholder};
    }

    &:focus {
        outline: none;
    }
`;
/*
overflow: hidden — 원래 textarea는 내용이 넘치면 스크롤바가 생기는데, 우리는 스크롤 대신 박스 자체가 늘어나게 할 거라 스크롤바는 안 보이게 숨김
resize: none — 기본 <textarea>는 우측 하단에 사용자가 드래그해서 크기 조절하는 손잡이가 자동으로 달려있는데, 이거 없애는 옵션 (우리가 자동으로 크기 조절할 거니까 사용자가 수동으로 만지면 안 됨)
border: none / background: transparent — 기본 테두리 제거하고 배경도 투명하게 → NoteWrapper의 노란 배경이 그대로 비쳐서 노트 안에 자연스럽게 녹아든 느낌이 남

&::placeholder { color: tokens.colors.text.placeholder } 추가 → 제목 placeholder 색이랑 통일
&:focus { outline: none } 추가 → 클릭 시 뜨는 파란 기본 테두리 제거
*/