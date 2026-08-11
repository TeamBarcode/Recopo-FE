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
import type { Category } from '@/components/common/Tag';
import Avatar from '@/components/common/Avatar';
import heartIcon from '@/assets/idea-heart.svg';
import commentIcon from '@/assets/idea-comment.svg';
import sendArrowIcon from '@/assets/comment-send-arrow.svg';
import clipIcon from '@/assets/idea-clip.svg';
import visibilityPublicIcon from '@/assets/idea-visibility-public.svg';
import visibilityPrivateIcon from '@/assets/idea-visibility-private.svg';

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

// 댓글 개수엔 답글도 포함해서 세야 함
const countCommentsAndReplies = (comments: Comment[]) =>
    comments.reduce((sum, comment) => sum + 1 + comment.replies.length, 0);

function IdeaDetailPage() {
    const { ideaId } = useParams();
    const navigate = useNavigate();
    const [idea, setIdea] = useState<IdeaDetail | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

    useEffect(() => {
        if (!ideaId) return;
        fetchMockIdeaDetail(ideaId).then((detail) =>
            setIdea({ ...detail, commentCount: countCommentsAndReplies(detail.comments) }),
        );
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
                <SmallButton variant="edit" onClick={handleEdit}>수정</SmallButton>
                <SmallButton variant="danger" onClick={() => setIsDeleteModalOpen(true)}>삭제</SmallButton>
            </TopRow>

            <HeaderRow>
                <Header>
                    <Title>{idea.title}</Title>
                    <TitleMeta>
                        <VisibilityIcon
                            src={idea.isPublic ? visibilityPublicIcon : visibilityPrivateIcon}
                            alt={idea.isPublic ? '공개' : '비공개'}
                        />
                        <DateText>{idea.createdAt}</DateText>
                    </TitleMeta>
                </Header>

                <MetaBox>
                    <MetaClip src={clipIcon} alt="" aria-hidden="true" />
                    <MetaRow>
                        <MetaLabel>카테고리</MetaLabel>
                        <MetaTagList>
                            <Tag variant="category" usage="idea" category={idea.category as Category}>{idea.category}</Tag>
                        </MetaTagList>
                    </MetaRow>
                    <MetaRow>
                        <MetaLabel>해시태그</MetaLabel>
                        <MetaTagList>
                            {idea.tags?.map((tag) => (
                                <Tag key={tag} variant="hashtag" usage="idea">{tag}</Tag>
                            ))}
                        </MetaTagList>
                    </MetaRow>
                </MetaBox>
            </HeaderRow>

            <ContentBox>
                <Section>
                    <SectionTitle>아이디어</SectionTitle>
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
                                ⭐ {formatCount(recommendedRepo.stars)} · Fork {formatCount(recommendedRepo.forks)}
                            </RepoMeta>
                        </RepoCard>
                    </Section>
                )}
            </ContentBox>

            <Footer>
                <FooterItem><HeartIcon src={heartIcon} alt="" />{idea.likeCount}개</FooterItem>
                <FooterItemButton type="button" onClick={() => setIsCommentSectionOpen((prev) => !prev)}>
                    <CommentIconImg src={commentIcon} alt="" />{idea.commentCount}개
                </FooterItemButton>
            </Footer>

            {isCommentSectionOpen && (
                <CommentSection
                    ideaId={ideaId!}
                    comments={idea.comments}
                    onCommentsChange={(comments) =>
                        setIdea((prev) =>
                            prev
                                ? { ...prev, comments, commentCount: countCommentsAndReplies(comments) }
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
                messageFontSize={tokens.fontSize.xl}
            />
        </Wrapper>
    );
}

export default IdeaDetailPage;

// ===== 댓글 영역 =====

interface CommentSectionProps {
    ideaId: string;
    comments: Comment[];
    onCommentsChange: (comments: Comment[]) => void;
}

function CommentSection({ ideaId, comments, onCommentsChange }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [openReplyCommentId, setOpenReplyCommentId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [openReplyMenuId, setOpenReplyMenuId] = useState<string | null>(null);

    const handleSubmitComment = async () => {
        const content = newComment.trim();
        if (!content) return;

        const created = await createMockComment({ ideaId, content });
        onCommentsChange([...comments, created]);
        setNewComment('');
    };

    const handleDeleteComment = async (commentId: string) => {
        await deleteMockComment(commentId);
        onCommentsChange(comments.filter((comment) => comment.id !== commentId));
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
                                답글
                            </Button>
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
                                </CommentBody>
                                {reply.authorNickname === mockUser.nickname && (
                                    <MenuWrapper>
                                        <MenuButton
                                            type="button"
                                            aria-label="답글 메뉴"
                                            onClick={() =>
                                                setOpenReplyMenuId((prev) => (prev === reply.id ? null : reply.id))
                                            }
                                        >
                                            ···
                                        </MenuButton>
                                        {openReplyMenuId === reply.id && (
                                            <MenuPopup
                                                type="button"
                                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                            >
                                                삭제
                                            </MenuPopup>
                                        )}
                                    </MenuWrapper>
                                )}
                            </ReplyItem>
                        ))}

                        {openReplyCommentId === comment.id && (
                            <ReplyInputRow>
                                <Avatar size="xs" src={mockUser.profileImageUrl} />
                                <PillInput
                                    value={replyInput}
                                    onChange={(e) => setReplyInput(e.target.value)}
                                    placeholder="답글을 입력해주세요"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubmitReply(comment.id);
                                        }
                                    }}
                                />
                                <SendButton type="button" aria-label="답글 등록" onClick={() => handleSubmitReply(comment.id)}>
                                    <img src={sendArrowIcon} alt="" />
                                </SendButton>
                            </ReplyInputRow>
                        )}
                    </CommentBody>
                    {comment.authorNickname === mockUser.nickname && (
                        <MenuWrapper>
                            <MenuButton
                                type="button"
                                aria-label="댓글 메뉴"
                                onClick={() => setOpenMenuId((prev) => (prev === comment.id ? null : comment.id))}
                            >
                                ···
                            </MenuButton>
                            {openMenuId === comment.id && (
                                <MenuPopup type="button" onClick={() => handleDeleteComment(comment.id)}>
                                    삭제
                                </MenuPopup>
                            )}
                        </MenuWrapper>
                    )}
                </CommentItem>
            ))}

            <NewCommentRow>
                <Avatar size="xs" src={mockUser.profileImageUrl} />
                <PillInput
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="회원님의 생각을 남겨보세요"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmitComment();
                        }
                    }}
                />
                <SendButton type="button" aria-label="댓글 등록" onClick={handleSubmitComment}>
                    <img src={sendArrowIcon} alt="" />
                </SendButton>
            </NewCommentRow>
        </CommentWrapper>
    );
}

const Wrapper = styled.div`
    position: relative;
    max-width: 744px;
    margin: 36px auto 80px;
    padding: 32px 36px 40px;
    border: 1px solid ${tokens.colors.border.primary};
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.25);
    background: white;
`;

const TopRow = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
`;

const SmallButton = styled(Button)`
    width: 44px;
    height: 18px;
    padding: 0;
    border-radius: 15px;
    font-size: 10px;
    border: none;
    ${({ variant }) => variant === 'edit' && `background-color: ${tokens.colors.button.light};`}
`;

const HeaderRow = styled.div``;

const Header = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 20px;
    max-width: calc(100% - 260px);
`;

const Title = styled.h1`
    flex: 0 1 auto;
    font-size: ${tokens.fontSize.title};
    font-weight: ${tokens.fontWeight.regular};
`;

const TitleMeta = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
`;

const VisibilityIcon = styled.img`
    flex-shrink: 0;
    width: 16px;
    height: 16px;
`;

const DateText = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.extraLight};
`;

const MetaBox = styled.div`
    position: absolute;
    top: -4px;
    right: 70px;
    width: 180px;
    padding: 24px 12px 12px;
    background: ${tokens.colors.background};
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
`;

const MetaClip = styled.img`
    position: absolute;
    top: -26px;
    left: 50%;
    width: 40px;
    height: 36px;
    transform: translateX(-50%);
`;

const MetaRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    & + & {
        margin-top: 16px;
    }
`;

const MetaLabel = styled.span`
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.extraLight};
`;

const MetaTagList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    & > span {
        font-size: 11px;
    }
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
    font-size: ${tokens.fontSize.xl};
    font-weight: ${tokens.fontWeight.semibold};
    margin-bottom: 12px;
`;

const BrainstormContent = styled.p`
    font-size: ${tokens.fontSize.lg};
    color: ${tokens.colors.text.light};
    white-space: pre-wrap;
`;

const TechStackList = styled.ul`
    padding-left: 18px;
    font-size: ${tokens.fontSize.lg};
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
    font-size: ${tokens.fontSize.xl};
    font-weight: ${tokens.fontWeight.medium};
`;

const RepoDescription = styled.div`
    margin-top: 4px;
    font-size: ${tokens.fontSize.lg};
    color: ${tokens.colors.text.light};
`;

const RepoReason = styled.div`
    margin-top: 8px;
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.extraLight};
`;

const RepoMeta = styled.div`
    margin-top: 8px;
    font-size: ${tokens.fontSize.md};
    color: ${tokens.colors.text.extraLight};
`;

const Footer = styled.div`
    display: flex;
    gap: 20px;
    margin-top: 20px;
    font-size: ${tokens.fontSize.md};
`;

const FooterItem = styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${tokens.colors.text.light};
`;

const HeartIcon = styled.img`
    width: 17px;
    height: 15px;
`;

const CommentIconImg = styled.img`
    width: 17px;
    height: 17px;
`;

const FooterItemButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
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
    position: relative;
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
    font-size: ${tokens.fontSize.xs};
    color: #8c8c8c;
`;

const CommentContent = styled.p`
    margin-top: 4px;
    font-size: ${tokens.fontSize.lg};
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
    align-items: center;
    margin-top: 10px;
    margin-left: 20px;
`;

const NewCommentRow = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`;

const PillInput = styled.input`
    flex: 1;
    height: 42px;
    padding: 0 16px;
    border: 1px solid ${tokens.colors.border.secondary};
    border-radius: 9999px;
    background: transparent;
    font-size: ${tokens.fontSize.md};

    &::placeholder {
        color: ${tokens.colors.text.placeholder};
    }

    &:focus {
        outline: none;
    }
`;

const SendButton = styled.button`
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: ${tokens.colors.button.light};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
        width: 13px;
        height: 13px;
        transform: rotate(-90deg);
    }

    &:active {
        opacity: 0.6;
    }
`;

const MenuWrapper = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const MenuButton = styled.button`
    border: none;
    background: none;
    padding: 4px;
    font-size: ${tokens.fontSize.lg};
    letter-spacing: -1px;
    color: ${tokens.colors.text.extraLight};
    cursor: pointer;
`;

const MenuPopup = styled.button`
    position: absolute;
    top: 50%;
    left: 100%;
    margin-left: 6px;
    transform: translateY(-50%);
    padding: 6px 14px;
    border: none;
    border-radius: 9999px;
    background: ${tokens.colors.button.light};
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);
    font-size: ${tokens.fontSize.md};
    white-space: nowrap;
    cursor: pointer;

    &:active {
        opacity: 0.6;
    }
`;
