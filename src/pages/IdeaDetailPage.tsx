import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import {
    fetchMockIdeaDetail,
    deleteMockIdea,
    createMockComment,
    deleteMockComment,
    createMockReply,
} from '@/mocks/ideaCards';
import type { IdeaDetail, Comment } from '@/mocks/ideaCards';
import { mockUser } from '@/mocks/user';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Tag from '@/components/common/Tag';
import Avatar from '@/components/common/Avatar';
import TextArea from '@/components/common/TextArea';

function IdeaDetailPage() {
    const { ideaId } = useParams();
    const navigate = useNavigate();
    const [idea, setIdea] = useState<IdeaDetail | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

    useEffect(() => {
        if (!ideaId) return;
        fetchMockIdeaDetail(ideaId).then(setIdea);
    }, [ideaId]);

    if (!idea) return <div>로딩중...</div>;

    const handleEdit = () => {
        navigate(`/ideas/${ideaId}/edit`);
    };

    const handleConfirmDelete = async () => {
        if (!ideaId) return;
        await deleteMockIdea(ideaId);
        navigate('/ideas');
    };

    // RecoBot 추천은 실제로 한 번에 레포 1개만 추천해주는 구조라, 여러 개 중 첫 번째만 보여줌
    const recommendedRepo = idea.recoBotResult[0];

    return (
        <Wrapper>
            <TopRow>
                <Button variant="edit" size="sm" onClick={handleEdit}>수정</Button>
                <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>삭제</Button>
            </TopRow>

            <Header>
                <Title>{idea.title}</Title>
                <DateText>{idea.createdAt}</DateText>
            </Header>

            <TagRow>
                <Tag variant="hashtag" usage="idea">{idea.category}</Tag>
                {idea.tags?.map((tag) => (
                    <Tag key={tag} variant="hashtag" usage="idea">{tag}</Tag>
                ))}
            </TagRow>

            <ContentBox>
                <Section>
                    <SectionTitle>아이디어 브레인스토밍</SectionTitle>
                    <BrainstormContent>{idea.brainstormContent || idea.summary}</BrainstormContent>
                </Section>

                {idea.techStack.length > 0 && (
                    <Section>
                        <SectionTitle>추천 기술 스택</SectionTitle>
                        <TechStackList>
                            {idea.techStack.map((tech) => (
                                <li key={tech}>{tech}</li>
                            ))}
                        </TechStackList>
                    </Section>
                )}

                {recommendedRepo && (
                    <Section>
                        <SectionTitle>추천 레포</SectionTitle>
                        <RepoCard href={recommendedRepo.repoUrl} target="_blank" rel="noreferrer">
                            <RepoName>{recommendedRepo.repoName}</RepoName>
                            <RepoDescription>{recommendedRepo.description}</RepoDescription>
                            <RepoReason>추천 이유: {recommendedRepo.reason}</RepoReason>
                            <RepoMeta>
                                ⭐ {(recommendedRepo.stars / 1000).toFixed(1)}k | GitHub 바로가기
                            </RepoMeta>
                        </RepoCard>
                    </Section>
                )}
            </ContentBox>

            <Footer>
                <FooterItem>♡ {idea.likeCount}개</FooterItem>
                <FooterItemButton type="button" onClick={() => setIsCommentSectionOpen((prev) => !prev)}>
                    💬 {idea.commentCount}개
                </FooterItemButton>
            </Footer>

            {isCommentSectionOpen && (
                <CommentSection
                    ideaId={ideaId!}
                    comments={idea.comments}
                    onCommentsChange={(comments, countDelta) =>
                        setIdea((prev) =>
                            prev
                                ? { ...prev, comments, commentCount: prev.commentCount + countDelta }
                                : prev,
                        )
                    }
                />
            )}

            <Modal
                type="confirm"
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                message="카드를 삭제할까요?"
            />
        </Wrapper>
    );
}

export default IdeaDetailPage;

// ===== 댓글 영역 =====

interface CommentSectionProps {
    ideaId: string;
    comments: Comment[];
    onCommentsChange: (comments: Comment[], countDelta: number) => void;
}

function CommentSection({ ideaId, comments, onCommentsChange }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [openReplyCommentId, setOpenReplyCommentId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');

    const handleSubmitComment = async () => {
        const content = newComment.trim();
        if (!content) return;

        const created = await createMockComment({ ideaId, content });
        onCommentsChange([...comments, created], 1);
        setNewComment('');
    };

    const handleDeleteComment = async (commentId: string) => {
        await deleteMockComment(commentId);
        onCommentsChange(comments.filter((comment) => comment.id !== commentId), -1);
    };

    const handleSubmitReply = async (commentId: string) => {
        const content = replyInput.trim();
        if (!content) return;

        const created = await createMockReply({ commentId, content });
        onCommentsChange(
            comments.map((comment) =>
                comment.id === commentId
                    ? { ...comment, replies: [...comment.replies, created] }
                    : comment,
            ),
            1,
        );
        setReplyInput('');
        setOpenReplyCommentId(null);
    };

    // 답글 삭제 mock API가 따로 없어서 로컬 상태에서만 제거
    const handleDeleteReply = (commentId: string, replyId: string) => {
        onCommentsChange(
            comments.map((comment) =>
                comment.id === commentId
                    ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== replyId) }
                    : comment,
            ),
            -1,
        );
    };

    return (
        <CommentWrapper>
            {comments.map((comment) => (
                <CommentItem key={comment.id}>
                    <Avatar size="xs" src={comment.authorProfileImageUrl} />
                    <CommentBody>
                        <CommentHeader>
                            <CommentAuthor>{comment.authorNickname}</CommentAuthor>
                            <CommentDate>{comment.createdAt}</CommentDate>
                        </CommentHeader>
                        <CommentContent>{comment.content}</CommentContent>
                        <CommentActions>
                            <Button
                                variant="text"
                                onClick={() =>
                                    setOpenReplyCommentId((prev) => (prev === comment.id ? null : comment.id))
                                }
                            >
                                답글달기
                            </Button>
                            {comment.authorNickname === mockUser.nickname && (
                                <Button variant="text" onClick={() => handleDeleteComment(comment.id)}>
                                    삭제
                                </Button>
                            )}
                        </CommentActions>

                        {comment.replies.map((reply) => (
                            <ReplyItem key={reply.id}>
                                <Avatar size="xs" src={reply.authorProfileImageUrl} />
                                <CommentBody>
                                    <CommentHeader>
                                        <CommentAuthor>{reply.authorNickname}</CommentAuthor>
                                        <CommentDate>{reply.createdAt}</CommentDate>
                                    </CommentHeader>
                                    <CommentContent>{reply.content}</CommentContent>
                                    {reply.authorNickname === mockUser.nickname && (
                                        <CommentActions>
                                            <Button
                                                variant="text"
                                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                            >
                                                삭제
                                            </Button>
                                        </CommentActions>
                                    )}
                                </CommentBody>
                            </ReplyItem>
                        ))}

                        {openReplyCommentId === comment.id && (
                            <ReplyInputRow>
                                <TextArea
                                    size="sm"
                                    width="100%"
                                    value={replyInput}
                                    onChange={(e) => setReplyInput(e.target.value)}
                                    placeholder="답글을 입력해주세요"
                                />
                                <Button variant="primary" size="sm" onClick={() => handleSubmitReply(comment.id)}>
                                    등록
                                </Button>
                            </ReplyInputRow>
                        )}
                    </CommentBody>
                </CommentItem>
            ))}

            <NewCommentRow>
                <TextArea
                    size="sm"
                    width="100%"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력해주세요"
                />
                <Button variant="primary" size="sm" onClick={handleSubmitComment}>
                    등록
                </Button>
            </NewCommentRow>
        </CommentWrapper>
    );
}

const Wrapper = styled.div`
    max-width: 744px;
    margin: 20px auto 0;
    padding-bottom: 60px;
`;

const TopRow = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
`;

const Header = styled.div`
    display: flex;
    align-items: baseline;
    gap: 12px;
`;

const Title = styled.h1`
    font-size: ${tokens.fontSize.title};
    font-weight: ${tokens.fontWeight.regular};
`;

const DateText = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
`;

const ContentBox = styled.div`
    margin-top: 24px;
    padding: 24px;
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: ${tokens.radius.sm};
`;

const Section = styled.div`
    & + & {
        margin-top: 32px;
    }
`;

const SectionTitle = styled.div`
    font-size: ${tokens.fontSize.lg};
    font-weight: ${tokens.fontWeight.semibold};
    margin-bottom: 12px;
`;

const BrainstormContent = styled.p`
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.light};
    white-space: pre-wrap;
`;

const TechStackList = styled.ul`
    padding-left: 18px;
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.light};

    li + li {
        margin-top: 4px;
    }
`;

const RepoCard = styled.a`
    display: block;
    padding: 16px;
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
`;

const RepoName = styled.div`
    font-size: ${tokens.fontSize.lg};
    font-weight: ${tokens.fontWeight.medium};
`;

const RepoDescription = styled.div`
    margin-top: 4px;
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.light};
`;

const RepoReason = styled.div`
    margin-top: 8px;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const RepoMeta = styled.div`
    margin-top: 8px;
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const Footer = styled.div`
    display: flex;
    gap: 20px;
    margin-top: 20px;
    font-size: ${tokens.fontSize.md};
`;

const FooterItem = styled.span`
    color: ${tokens.colors.text.light};
`;

const FooterItemButton = styled.button`
    border: none;
    background: none;
    padding: 0;
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.light};
    cursor: pointer;
`;

const CommentWrapper = styled.div`
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid ${tokens.colors.border.primary};
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const CommentItem = styled.div`
    display: flex;
    gap: 10px;
`;

const CommentBody = styled.div`
    flex: 1;
`;

const CommentHeader = styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
`;

const CommentAuthor = styled.span`
    font-size: ${tokens.fontSize.md};
    font-weight: ${tokens.fontWeight.medium};
`;

const CommentDate = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const CommentContent = styled.p`
    margin-top: 4px;
    font-size: ${tokens.fontSize.md};
`;

const CommentActions = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 6px;
`;

const ReplyItem = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 12px;
    margin-left: 20px;
`;

const ReplyInputRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-top: 10px;
    margin-left: 20px;
`;

const NewCommentRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: flex-end;
`;
