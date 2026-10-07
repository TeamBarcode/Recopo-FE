import styled, { keyframes } from 'styled-components';

import { tokens } from '@/styles/tokens';

interface LoadingProps {
    label?: string;
    size?: number;
    minHeight?: string;
    className?: string;
}

const BAR_COUNT = 12;

function Loading({ label = '로딩중...', size = 56, minHeight = '200px', className }: LoadingProps) {
    return (
        <Wrapper $minHeight={minHeight} className={className}>
            <Spinner role="status" aria-label={label} $size={size}>
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                    <Bar
                        key={i}
                        $size={size}
                        style={{
                            transform: `rotate(${i * (360 / BAR_COUNT)}deg)`,
                            animationDelay: `${(i / BAR_COUNT) - 1}s`,
                        }}
                    />
                ))}
            </Spinner>
            {label && <Label>{label}</Label>}
        </Wrapper>
    );
}

export default Loading;

const Wrapper = styled.div<{ $minHeight: string }>`
    width : 100%;
    min-height : ${({ $minHeight }) => $minHeight};
    display : flex;
    flex-direction : column;
    align-items : center;
    justify-content : center;
    gap : 16px;
`;

const Spinner = styled.div<{ $size: number }>`
    position : relative;
    width : ${({ $size }) => $size}px;
    height : ${({ $size }) => $size}px;
`;

const fade = keyframes`
    0% { opacity : 1; }
    100% { opacity : 0.15; }
`;

const Bar = styled.div<{ $size: number }>`
    position : absolute;
    top : 0;
    left : 50%;
    width : ${({ $size }) => Math.max(2, $size * 0.09)}px;
    height : ${({ $size }) => $size * 0.28}px;
    margin-left : ${({ $size }) => -(Math.max(2, $size * 0.09) / 2)}px;
    border-radius : ${tokens.radius.xs};
    background : ${tokens.colors.text.primary};
    transform-origin : 50% ${({ $size }) => $size / 2}px;
    opacity : 0.15;
    animation : ${fade} 1s linear infinite;
`;

const Label = styled.div`
    font-family : ${tokens.fontFamily.primary};
    font-size : ${tokens.fontSize.md};
    font-weight : ${tokens.fontWeight.regular};
    color : ${tokens.colors.text.extraLight};
`;
