import styled from 'styled-components';

interface TagProps {
  children: React.ReactNode;
}

const StyledTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 19px;
  padding: 0 8px; /* 좌우 여백, 값은 피그마 보고 조정 */
  border-radius: 9999px; /* 높이 절반 이상으로 완전히 둥글게 */
  background-color: #D4D18C; /* 스샷 색상 추정치, 정확한 hex 알려주면 교체 */
  font-size: 9px;
  white-space: nowrap;
`;

function Tag({ children }: TagProps) {
  return <StyledTag>{children}</StyledTag>;
}

export default Tag;