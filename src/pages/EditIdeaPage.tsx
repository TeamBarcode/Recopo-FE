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

const CATEGORY_OPTIONS = [
    '콘텐츠/미디어', '생활', '건강', '업무/도구', '개발/디자인', '사람', '기타',
];

function EditIdeaPage() {
    const { ideaId } = useParams();
    const navigate = useNavigate();

    const [idea, setIdea] = useState<IdeaDetail | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        if (!ideaId) return;
        fetchMockIdeaDetail(ideaId).then((data) => {
            setIdea(data);
            setTitle(data.title);
            setCategory(data.category);
            setIsPublic(data.isPublic);
        });
    }, [ideaId]);

    if (!idea) return <div>로딩중...</div>;

    const handleConfirmSave = async () => {
        if (!ideaId) return;
        await updateMockIdea(ideaId, { title, category, isPublic, tags: idea.tags });
        navigate(`/ideas/${ideaId}`);
    };

    const handleConfirmCancel = () => {
        navigate(`/ideas/${ideaId}`);
    };

    return (
        <Wrapper>
            <FieldRow>
                <Label>제목</Label>
                <Input size="lg" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
            </FieldRow>

            <FieldRow>
                <Label>카테고리</Label>
                <Dropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} size="md" placeholder="카테고리" />
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

            {/* TODO(2차): 해시태그 편집 UI (추가/삭제) */}

            <ButtonRow>
                <Button variant="cancel" onClick={() => setIsCancelModalOpen(true)}>취소</Button>
                <Button variant="primary" onClick={() => setIsSaveModalOpen(true)}>저장</Button>
            </ButtonRow>

            <Modal
                type="confirm"
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                message="수정사항을 저장할까요?"
            />
            <Modal
                type="confirm"
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                message="수정을 취소할까요? 변경사항은 저장되지 않아요"
            />
        </Wrapper>
    );
}

export default EditIdeaPage;

const Wrapper = styled.div`
    max-width: 560px;
    margin: 20px auto 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FieldRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.div`
    font-size: ${tokens.fontSize.md};
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
    margin-top: 12px;
`;
