import styled from 'styled-components';

import { tokens } from '@/styles/tokens';

interface ErrorStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    minHeight?: string;
    size?: 'sm' | 'lg';
    className?: string;
}

function ErrorState({
    title,
    description,
    actionLabel,
    onAction,
    minHeight = '200px',
    size = 'sm',
    className,
}: ErrorStateProps) {
    return (
        <Wrapper $minHeight={minHeight} className={className} role="alert">
            <Title $size={size}>{title}</Title>
            {description && <Description $size={size}>{description}</Description>}
            {actionLabel && onAction && (
                <ActionButton type="button" $size={size} onClick={onAction}>
                    {actionLabel}
                </ActionButton>
            )}
        </Wrapper>
    );
}

export default ErrorState;

const Wrapper = styled.div<{ $minHeight: string }>`
    width : 100%;
    min-height : ${({ $minHeight }) => $minHeight};
    display : flex;
    flex-direction : column;
    align-items : center;
    justify-content : center;
    gap : 8px;
    text-align : center;
`;

const Title = styled.div<{ $size: 'sm' | 'lg' }>`
    font-family : ${tokens.fontFamily.primary};
    font-size : ${({ $size }) => ($size === 'lg' ? tokens.fontSize.xl : tokens.fontSize.lg)};
    font-weight : ${({ $size }) => ($size === 'lg' ? tokens.fontWeight.semibold : tokens.fontWeight.medium)};
    color : ${tokens.colors.text.primary};
`;

const Description = styled.div<{ $size: 'sm' | 'lg' }>`
    font-family : ${tokens.fontFamily.primary};
    font-size : ${({ $size }) => ($size === 'lg' ? tokens.fontSize.lg : tokens.fontSize.md)};
    font-weight : ${tokens.fontWeight.regular};
    color : ${tokens.colors.text.extraLight};
`;

const ActionButton = styled.button<{ $size: 'sm' | 'lg' }>`
    margin-top : ${({ $size }) => ($size === 'lg' ? '16px' : '8px')};
    border : none;
    border-radius : ${tokens.radius.xs};
    background : #000000;
    color : #FFFFFF;
    padding : ${({ $size }) => ($size === 'lg' ? '10px 26px' : '8px 20px')};
    font-family : ${tokens.fontFamily.primary};
    font-size : ${({ $size }) => ($size === 'lg' ? tokens.fontSize.md : tokens.fontSize.sm)};
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:active {
        opacity : 0.7;
    }
`;
