import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { tokens } from '@/styles/tokens';
import { fetchMockIdeaDetail } from '@/mocks/ideaCards';
import type { IdeaDetail } from '@/mocks/ideaCards';

function IdeaDetailPage() {
    const { ideaId } = useParams();
    const [idea, setIdea] = useState<IdeaDetail | null>(null);

    useEffect(() => {
        if (!ideaId) return;
        fetchMockIdeaDetail(ideaId).then(setIdea);
    }, [ideaId]);

    if (!idea) return <div>로딩중...</div>;

    return (
        <Wrapper>
            <Header>
                <Title>{idea.title}</Title>
                <Visibility>{idea.isPublic ? '공개' : '비공개'}</Visibility>
            </Header>
            <Summary>{idea.summary}</Summary>

            {idea.recoBotResult.length > 0 && (
                <RecoSection>
                    <RecoSectionLabel>RecoBot의 추천결과</RecoSectionLabel>
                    {idea.recoBotResult.map((item) => (
                        <RepoCard key={item.id} href={item.repoUrl} target="_blank" rel="noreferrer">
                            <RepoName>{item.repoName}</RepoName>
                            <RepoDescription>{item.description}</RepoDescription>
                            <RepoReason>추천 이유: {item.reason}</RepoReason>
                        </RepoCard>
                    ))}
                </RecoSection>
            )}
        </Wrapper>
    );
}

export default IdeaDetailPage;

const Wrapper = styled.div`
    max-width: 744px;
    margin: 20px auto 0;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Title = styled.h1`
    font-size: ${tokens.fontSize.title};
    font-weight: ${tokens.fontWeight.regular};
`;

const Visibility = styled.span`
    font-size: ${tokens.fontSize.sm};
    color: ${tokens.colors.text.light};
    padding: 4px 10px;
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: 9999px;
`;

const Summary = styled.p`
    margin-top: 16px;
    font-size: ${tokens.fontSize.lg};
    color: ${tokens.colors.text.light};
    white-space: pre-wrap;
`;

const RecoSection = styled.div`
    margin-top: 40px;
`;

const RecoSectionLabel = styled.div`
    width: 140px;
    height: 35px;
    background: #ffb57d;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
`;

const RepoCard = styled.a`
    display: block;
    padding: 16px;
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
    margin-bottom: 12px;
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
