import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import { fetchMockIdeaDetail, updateMockIdea } from '@/mocks/ideaCards';
import type { IdeaDetail } from '@/mocks/ideaCards';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import Modal from '@/components/common/Modal';
import profileEditIcon from '@/assets/profile_edit.svg';

const CATEGORY_OPTIONS = [
    '콘텐츠/미디어', '생활', '건강', '업무/도구', '개발/디자인', '사람', '기타',
];

const MAX_TAGS = 5;

function EditIdeaPage() {
    const { ideaId } = useParams();
    const navigate = useNavigate();

    const [idea, setIdea] = useState<IdeaDetail | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        if (!ideaId) return;
        fetchMockIdeaDetail(ideaId).then((data) => {
            setIdea(data);
            setTitle(data.title);
            setCategory(data.category);
            setIsPublic(data.isPublic);
            setTags(data.tags ?? []);
        });
    }, [ideaId]);

    if (!idea) return <div>로딩중...</div>;

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

    const handleConfirmSave = async () => {
        if (!ideaId) return;
        await updateMockIdea(ideaId, { title, category, isPublic, tags });
        navigate(`/ideas/${ideaId}`);
    };

    const handleConfirmCancel = () => {
        navigate(`/ideas/${ideaId}`);
    };

    return (
        <Wrapper>
            <ButtonRow>
                <Button variant="cancel" onClick={() => setIsCancelModalOpen(true)}>취소</Button>
                <Button variant="primary" onClick={() => setIsSaveModalOpen(true)}>저장</Button>
            </ButtonRow>

            <FieldRow>
                <Label>제목</Label>
                <TitleInputWrapper>
                    <TitleInput size="lg" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
                    <TitleUnderline />
                </TitleInputWrapper>
            </FieldRow>

            <FieldRow>
                <Label>카테고리</Label>
                <Dropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} size="sm" placeholder="카테고리" />
            </FieldRow>

            <FieldRow>
                <Label>공개 여부</Label>
                <VisibilityRow>
                    <VisibilityButton type="button" $active={isPublic} onClick={() => setIsPublic(true)}>
                        공개
                    </VisibilityButton>
                    <VisibilityButton type="button" $active={!isPublic} onClick={() => setIsPublic(false)}>
                        비공개
                    </VisibilityButton>
                </VisibilityRow>
            </FieldRow>

            <FieldRow style={{ gap: '14px' }}>
                <Label>해시태그 (최대 {MAX_TAGS}개)</Label>
                <TagChipList>
                    {tags.map((tag, index) => (
                        <TagChipWrapper key={`${tag}-${index}`}>
                            <TagChip $editing={editingTagIndex === index}>
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
            </FieldRow>

            <Modal
                type="confirm"
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                message="수정사항을 저장할까요?"
                messageFontSize={tokens.fontSize.xl}
            />
            <Modal
                type="confirm"
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                message={'수정을 취소할까요?\n변경사항은 저장되지 않아요'}
                messageFontSize={tokens.fontSize.xl}
            />
        </Wrapper>
    );
}

export default EditIdeaPage;

const TitleInput = styled(Input)``;

const TitleInputWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const TitleUnderline = styled.div`
    height: 1px;
    margin-top: 10px;
    background: ${tokens.colors.border.secondary};
`;

const Wrapper = styled.div`
    max-width: 560px;
    margin: 20px auto 0;
    padding: 32px 36px 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    border: 1px solid ${tokens.colors.border.primary};
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.25);
    background: white;
`;

const FieldRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.div`
    font-size: ${tokens.fontSize.lg};
    color: ${tokens.colors.text.light};
`;

const VisibilityRow = styled.div`
    display: flex;
    gap: 8px;
`;

const VisibilityButton = styled.button<{ $active: boolean }>`
    padding: ${tokens.spacing[8]} ${tokens.spacing[16]};
    border-radius: ${tokens.radius.sm};
    border: 1px solid ${tokens.colors.border.search};
    font-size: ${tokens.fontSize.md};
    cursor: pointer;
    background-color: ${({ $active }) => ($active ? tokens.colors.border.secondary : tokens.colors.button.white)};

    &:active {
        opacity: 0.6;
    }
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
`;

const TagChipList = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
`;

const TagChipWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 3px;
`;

const TagChip = styled.div<{ $editing?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 9999px;
    background: ${({ $editing }) => ($editing ? tokens.colors.button.focus : tokens.colors.button.light)};
`;

const RemoveTagButton = styled.button`
    position: absolute;
    top: -6px;
    left: -6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: none;
    background: #ffffff;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
    font-size: 9px;
    line-height: 1;
    color: ${tokens.colors.text.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
`;

const TagChipText = styled.span`
    font-size: 14px;
    font-weight: ${tokens.fontWeight.regular};
`;

const EditTagButton = styled.button`
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 100%;
        height: 100%;
    }
`;

const HashtagInputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const HashtagTextInput = styled.input`
    flex: 1;
    border: none;
    border-bottom: 1px solid ${tokens.colors.border.secondary};
    background: transparent;
    padding: 0 0 6px;
    font-size: 15px;
    font-family: inherit;

    &::placeholder {
        color: ${tokens.colors.text.placeholder};
        font-size: ${tokens.fontSize.md};
    }

    &:focus {
        outline: none;
    }
`;

const ConfirmTagButton = styled.button`
    flex-shrink: 0;
    width: 50px;
    height: 25px;
    border: 1px solid ${tokens.colors.border.search};
    border-radius: 10px;
    background: #ffffff;
    font-size: 12px;
    font-weight: ${tokens.fontWeight.regular};
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;
