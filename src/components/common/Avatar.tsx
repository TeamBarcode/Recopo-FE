import styled from 'styled-components';
import defaultProfile from '@/assets/profile.svg';

/*Props 타입 정의*/
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/*위치별 사이즈*/
const sizeMap = {
  xs: '30px', // 댓글
  sm: '42px', // 친구 목록, 알림창
  md: '65px', // 상단바
  lg: '88px', // 마이페이지
};

/*스타일*/
const StyledAvatar = styled.div<{ size: 'xs' | 'sm' | 'md' | 'lg'; src?: string }>`
  width: ${({ size }) => sizeMap[size]};
  height: ${({ size }) => sizeMap[size]};
  border-radius: 50%;
  background-color: #d9d9d9;
  background-image: ${({ src }) => `url("${src || defaultProfile}")`};
  background-size: cover;
  background-position: center;
`;

/*Avatar 컴포넌트 정의*/
function Avatar({ src, alt = '프로필 이미지', size = 'md' }: AvatarProps) {
  return <StyledAvatar role="img" aria-label={alt} src={src} size={size} />;
}

export default Avatar;
