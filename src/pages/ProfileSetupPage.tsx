import { useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import recobotHappy from '@/assets/recobot-happy.svg';
import Avatar from '@/components/common/Avatar';
import Input from '@/components/common/Input';
import { useProfileSetup } from '@/features/auth/hooks/useProfileSetup';
import { tokens } from '@/styles/tokens';

function ProfileSetupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    userId,
    nickname,
    profileImage,
    isUserIdChecked,
    isNicknameChecked,
    isNextEnabled,
    checkUserId,
    checkNickname,
    handleUserIdChange,
    handleNicknameChange,
    handleProfileImageChange,
  } = useProfileSetup();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    handleProfileImageChange(URL.createObjectURL(file));
  };

  return (
    <PageContainer>
      <PageInner>
        <LogoArea>
          <LogoTitle>Recopo.</LogoTitle>
          <LogoSubtitle>design your idea</LogoSubtitle>
        </LogoArea>

        <Content>
          <TitleRow>
            <Title>프로필 설정</Title>
            <Recobot src={recobotHappy} alt="" />
          </TitleRow>

          <ProfileArea>
            <Avatar src={profileImage ?? undefined} size="lg" />

            <UploadButton type="button" onClick={() => fileInputRef.current?.click()}>
              이미지 업로드
            </UploadButton>

            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </ProfileArea>

          <Form>
            <FieldRow>
              <InputBox>
                <Input
                  value={userId}
                  onChange={(event) => handleUserIdChange(event.target.value)}
                  placeholder="아이디"
                  size="md"
                />
              </InputBox>

              <CheckButton type="button" onClick={checkUserId}>
                중복 확인
              </CheckButton>
            </FieldRow>

            {isUserIdChecked && <SuccessMessage>사용 가능한 아이디입니다.</SuccessMessage>}

            <FieldRow>
              <InputBox>
                <Input
                  value={nickname}
                  onChange={(event) => handleNicknameChange(event.target.value)}
                  placeholder="이름"
                  size="md"
                />
              </InputBox>

              <CheckButton type="button" onClick={checkNickname}>
                확인
              </CheckButton>
            </FieldRow>

            {isNicknameChecked && <SuccessMessage>사용 가능한 이름입니다.</SuccessMessage>}
          </Form>

          <NextButton type="button" disabled={!isNextEnabled} onClick={() => navigate('/')}>
            다음
          </NextButton>
        </Content>
      </PageInner>
    </PageContainer>
  );
}

export default ProfileSetupPage;

const PageContainer = styled.main`
  width: 100%;
  min-height: 100vh;
  background: ${tokens.colors.background};
  font-family: ${tokens.fontFamily.primary};
`;

const PageInner = styled.div`
  width: 100%;
  max-width: 1280px;
  min-height: 832px;
  margin: 0 auto;
  padding: 40px 80px;
  box-sizing: border-box;
`;

const LogoArea = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const LogoTitle = styled.span`
  font-family: ${tokens.fontFamily.logo};
  font-size: ${tokens.fontSize.logo};
  line-height: 0.9;
`;

const LogoSubtitle = styled.span`
  margin-top: ${tokens.spacing[4]};
  font-family: ${tokens.fontFamily.logo};
  font-size: ${tokens.fontSize.xl};
  line-height: 1;
`;

const Content = styled.section`
  width: 420px;
  margin: 70px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[10]};
  margin-bottom: ${tokens.spacing[32]};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${tokens.fontSize.title};
  font-weight: ${tokens.fontWeight.bold};
`;

const Recobot = styled.img`
  width: 38px;
  height: 38px;
`;

const ProfileArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadButton = styled.button`
  margin-top: ${tokens.spacing[10]};
  padding: 0;
  border: none;
  background: transparent;
  color: ${tokens.colors.text.extraLight};
  font-family: inherit;
  font-size: ${tokens.fontSize.md};
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Form = styled.div`
  width: 100%;
  margin-top: ${tokens.spacing[32]};
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[12]};
`;

const FieldRow = styled.div`
  display: flex;
  gap: ${tokens.spacing[10]};
`;

const InputBox = styled.div`
  flex: 1;
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.radius.sm};
`;

const CheckButton = styled.button`
  width: 84px;
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.radius.sm};
  background: ${tokens.colors.button.white};
  font-family: inherit;
  font-size: ${tokens.fontSize.md};
  cursor: pointer;
`;

const SuccessMessage = styled.p`
  margin: -6px 0 0;
  color: ${tokens.colors.text.extraLight};
  font-size: ${tokens.fontSize.sm};
`;

const NextButton = styled.button`
  width: 100%;
  height: 44px;
  margin-top: ${tokens.spacing[32]};
  border: none;
  border-radius: ${tokens.radius.sm};
  background: ${tokens.colors.button.black};
  color: ${tokens.colors.button.white};
  font-family: inherit;
  font-size: ${tokens.fontSize.lg};
  cursor: pointer;

  &:disabled {
    background: ${tokens.colors.button.disabled};
    cursor: not-allowed;
  }
`;
