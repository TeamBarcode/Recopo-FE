import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import { useRef, useEffect } from 'react';

import {tokens} from '@/styles/tokens';
import Dropdown from '@/components/common/Dropdown';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { createMockBrainstormCard, UpdateMockBrainstormCard } from '@/mocks/brainstormCards';
import tape from '@/assets/tape.svg';
import profileEditIcon from '@/assets/profile_edit.svg';
import type {BrainstormCard} from '@/mocks/brainstormCards';

const CATEGORY_OPTIONS = [
  '콘텐츠/미디어', '생활', '건강', '업무/도구', '개발/디자인', '사람', '기타',
];

const MAX_TAGS = 5;

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

    const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
    const [tagInput, setTagInput] = useState('');
    const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
    const [isSaveFailedModalOpen, setIsSaveFailedModalOpen] = useState(false);
    const isSubmittingRef = useRef(false);

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

    const handleConfirmTag = () => {
        const trimmed = tagInput.trim();
        if (!trimmed) return;
        const formatted = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

        if (editingTagIndex !== null) {
            // 수정 모드면 새 태그를 추가하는 게 아니라 그 자리 태그 내용만 바꿈
            setTags((prev) => prev.map((t, i) => (i === editingTagIndex ? formatted : t)));
            setEditingTagIndex(null);
        } else {
            if (tags.length >= MAX_TAGS) return;
            setTags((prev) => [...prev, formatted]);
        }

        setTagInput('');
    };

    const handleRemoveTag = (index: number) => {
        setTags((prev) => prev.filter((_, i) => i !== index));
        if (editingTagIndex === index) {
            setEditingTagIndex(null);
            setTagInput('');
        }
    };

    const handleEditTag = (index: number) => {
        setTagInput(tags[index].replace(/^#/, ''));
        setEditingTagIndex(index);
    };

    const handleSubmit = async() => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        //저장버튼 눌렀을 때 새 카드 생성인지 수정인지에 따라 다른 mock 함수 호출
        if(mode === 'edit' && cardId){
            try {
                await UpdateMockBrainstormCard(cardId, {title, content, category, tags});
                navigate(`/brainstorm/${cardId}`);
            } catch {
                setIsSaveFailedModalOpen(true);
            } finally {
                isSubmittingRef.current = false;
            }
        }else {
            // mock 서버(가짜 API)한테 카드 생성 요청 보내고, 응답 기다리기
            const newCard = await createMockBrainstormCard({
                title, content, category, tags,
            });
            // await가 있어서 여기서 500ms 동안 멈춰있다가 서버가 만들어준 완성된 카드(id 포함)를 newCard에 받음
            isSubmittingRef.current = false;

            // 방금 만든 카드의 id로 상세 페이지 이동
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

            <HashtagLabelRow>
                <HashtagLabel>해시태그 (최대 {MAX_TAGS}개)</HashtagLabel>
                <TagChipList>
                    {tags.map((tag, index) => (
                        <TagChipWrapper key={`${tag}-${index}`}>
                            <TagChip>
                                <RemoveTagButton type="button" onClick={() => handleRemoveTag(index)} aria-label="해시태그 삭제">
                                    ×
                                </RemoveTagButton>
                                <TagChipText>{tag}</TagChipText>
                            </TagChip>
                            <EditTagButton type="button" onClick={() => handleEditTag(index)} aria-label="해시태그 수정">
                                <img src={profileEditIcon} alt="" />
                            </EditTagButton>
                        </TagChipWrapper>
                    ))}
                </TagChipList>
            </HashtagLabelRow>

            <HashtagInputRow>
                <HashtagTextInput
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleConfirmTag();
                        }
                    }}
                    placeholder="해시태그를 입력하세요"
                />
                <ConfirmTagButton type="button" onClick={handleConfirmTag}>확인</ConfirmTagButton>
            </HashtagInputRow>

            <ContentTextArea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" />

            <Modal
                type="confirm"
                isOpen={isSaveFailedModalOpen}
                onClose={() => setIsSaveFailedModalOpen(false)}
                message={'저장에 실패했어요.\n다시 시도해주세요'}
                cancelText="닫기"
                messageFontSize={tokens.fontSize.xl}
            />
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
  margin-bottom: 18px;
  padding-left: 0;

  &::placeholder {
    color: #626262;
  }
`;
//padding-left: 0 추가 → Input.tsx의 기본 좌측 패딩(16px) 제거해서 ContentTextarea와 왼쪽 정렬 맞춤

const HashtagLabelRow = styled.div`
    display : flex;
    align-items : center;
    flex-wrap : wrap;
    row-gap : 8px;
    margin-bottom : 18px;
`;

const HashtagLabel = styled.span`
    flex-shrink : 0;
    font-size : 16px;
    font-weight : ${tokens.fontWeight.regular};
    color : #626262;
`;

const TagChipList = styled.div`
    display : flex;
    flex-wrap : wrap;
    align-items : center;
    gap : 12px;
    margin-left : 42px;
`;

const TagChipWrapper = styled.div`
    display : flex;
    align-items : center;
    gap : 3px;
`;

const TagChip = styled.div`
    position : relative;
    display : flex;
    align-items : center;
    padding : 4px 10px;
    border-radius : 9999px;
    background : ${tokens.colors.button.light};
`;

const RemoveTagButton = styled.button`
    position : absolute;
    top : -6px;
    left : -6px;
    width : 14px;
    height : 14px;
    border-radius : 50%;
    border : none;
    background : #FFFFFF;
    box-shadow : 0px 1px 2px rgba(0, 0, 0, 0.25);
    font-size : 9px;
    line-height : 1;
    color : ${tokens.colors.text.primary};
    cursor : pointer;
    display : flex;
    align-items : center;
    justify-content : center;
    padding : 0;
`;

const TagChipText = styled.span`
    font-size : 12px;
    font-weight : ${tokens.fontWeight.regular};
`;

const EditTagButton = styled.button`
    flex-shrink : 0;
    width : 18px;
    height : 18px;
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
`;

const HashtagInputRow = styled.div`
    width : 672px;
    display : flex;
    align-items : center;
    gap : 12px;
    margin-bottom : 30px;
`;

const HashtagTextInput = styled.input`
    flex : 1;
    border : none;
    border-bottom : 1px solid #626262;
    background : transparent;
    padding : 0 0 6px;
    font-size : 15px;
    font-family : inherit;

    &::placeholder {
        color : #626262;
    }

    &:focus {
        outline : none;
    }
`;

const ConfirmTagButton = styled.button`
    flex-shrink : 0;
    width : 50px;
    height : 25px;
    margin-right : 7px;
    border : none;
    border-radius : 10px;
    background : #FFFFFF;
    font-size : 12px;
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:active {
        opacity : 0.6;
    }
`;

const ContentTextArea = styled.textarea`
    width : 672px;
    min-height : 502px;
    font-size : 15px;
    overflow: hidden;
    resize : none;
    border : none;
    background : transparent;

    &::placeholder {
    color: #626262;
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
