import Button from '@/components/common/Button';
import Recobot from '@/assets/recobot.svg';
import GoogleIcon from '@/assets/google Logo.svg';
import styled from 'styled-components';
import {tokens} from '@/styles/tokens';
import { useGoogleLogin } from '@/features/auth/hooks/useGoogleLogin';

/*LoginEntry 컴포넌트 정의 */
//PageContainer : 배경색을 화면 전체까지 깔아주는 가장 바깥 껍데기
//PageInner : 실제 눈에 보이는 콘텐츠가 들어갈 자리 정함.
function LoginEntry() {
    const { buttonContainerRef } = useGoogleLogin();

    return (
        <PageContainer>
            <PageInner>
                <LogoArea>
                    <LogoTitle>Recopo.</LogoTitle>
                    <LogoSubtitle>design your idea</LogoSubtitle>
                </LogoArea>

                <Content>
                    {/* 아이콘 + "로그인" 타이틀 */}
                    <TitleRow>
                        <img src={Recobot} width={50} height={50} alt="" />
                        <Title>로그인</Title>
                    </TitleRow>

                    {/* 구글 로그인 버튼: 실제 구글 버튼(투명)을 커스텀 디자인 버튼 위에 겹쳐서 클릭을 받음 */}
                    <GoogleButtonWrapper>
                        <GoogleLoginButton variant="primary">
                            <GoogleIconImg src={GoogleIcon} width={24} height={24} alt="" />
                            구글로 로그인
                        </GoogleLoginButton>
                        <GoogleButtonOverlay ref={buttonContainerRef} />
                    </GoogleButtonWrapper>
                </Content>
            </PageInner>
        </PageContainer>
    );
}

export default LoginEntry;

const PageContainer = styled.main`
    width : 100%;
    min-height : 100vh;
    background : ${tokens.colors.background};
    font-family : ${tokens.fontFamily.primary};
`;

const PageInner = styled.div`
    width : 100%; 
    max-width: 1280px;
    min-height: 832px;
    margin : 0 auto;
    padding : 40px 80px;
    box-sizing : border-box;
`;
/* PageInner
   - width: 100% → max-width와 짝을 이뤄, 화면이 1280px보다 좁으면 꽉 채우고
     넓으면 1280px에서 멈추는 반응형 동작을 만듦
   - max-width: 1280px → 화면이 넓어져도 콘텐츠가 무한정 안 퍼지게 제한 (노트북 기준 표준 너비)
   - margin: 0 auto → 부모보다 좁아진 만큼 남는 공간을 좌우로 반씩 나눠서 가운데 정렬
     (max-width로 남는 공간이 생겨야 효과가 있음, 100%로 꽉 차 있으면 의미 없음)
   - padding: 40px 80px → 안쪽 여백. LogoArea는 이 값 그대로가 최종 위치가 되고,
     Content는 이 값 위에 자신의 margin-top(186px)이 추가로 더해짐
   - box-sizing: border-box → padding을 max-width 안에 포함시켜서, 실제 너비가
     1280px + padding만큼 더 커지는 걸 방지 (border-box 없으면 1280 + 160 = 1440px가 돼버림) 
*/

const LogoArea = styled.div`
    display : inline-flex;
    flex-direction: column;
`;
//inline-flex를 쓰면 로고 텍스트 크기에 딱 맞는 작은 박스가 됨.

/*헤더에 있는대로*/
const LogoTitle = styled.span`
  font-family: ${tokens.fontFamily.logo};
  font-size: ${tokens.fontSize.logo};
  font-weight: ${tokens.fontWeight.bold};
  line-height: 0.9;
  letter-spacing: -1.4px;
  white-space: nowrap;

  @media (max-width: 900px) {
    font-size: 30px;
  }
`;

const LogoSubtitle = styled.span`
  margin-top: ${tokens.spacing[4]};
  font-family: ${tokens.fontFamily.logo};
  font-size: ${tokens.fontSize.xl};
  font-weight: ${tokens.fontWeight.bold};
  line-height: 1;
  letter-spacing: -0.7px;
  white-space: nowrap;

  @media (max-width: 900px) {
    font-size: 14px;
  }
`;

const Content = styled.section`
    display : flex;
    flex-direction : column;
    align-items : center;
    margin-top : 186px;
`;
//width 불필요한 것 같아서 뺌.

const TitleRow = styled.div`
    display: flex;
    align-items : center;
    gap : 18px;
    margin-bottom : 94px;
`;

const Title = styled.h1`
    margin : 0;
    font-size : ${tokens.fontSize.page};
    font-weigth : ${tokens.fontWeight.semibold};
    line-height: 1;
`;
//margin : 0인 이유 브라우저가 h1 태그에 기본적으로 위아래 여백을 줘서

const GoogleButtonWrapper = styled.div`
  position: relative;
  width: 280px;
  height: 42px;
  margin-bottom: 83px;
`;

const GoogleLoginButton = styled(Button)`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 1px solid #E7E7E7;
  font-weight: ${tokens.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
`;
/*
position : relative 아이콘의 기준점이 구글 로그인 버튼이 되게 함.
justify-content: center; 텍스트를 버튼 중앙에 정렬
*/

// 실제 구글 로그인 버튼(iframe)을 투명하게 겹쳐서, 사용자 클릭이 진짜 구글 버튼에 전달되게 함
const GoogleButtonOverlay = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;

  > div {
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const GoogleIconImg = styled.img`
  position: absolute;
  left: 15px;
  top: 9px;
  width: 24px;
  height: 24px;
`;