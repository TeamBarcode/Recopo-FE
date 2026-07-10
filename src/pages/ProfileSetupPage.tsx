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
            <Recobot src={recobotHappy} alt="" />
            <Title>프로필 설정</Title>
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
            <FieldGroup>
              <FieldLabel htmlFor="user-id">아이디</FieldLabel>

              <FieldRow>
                <UnderlinedInput>
                  <Input
                    value={userId}
                    onChange={(event) => handleUserIdChange(event.target.value)}
                    placeholder=""
                    size="md"
                    width="100%"
                  />
                </UnderlinedInput>

                <CheckButton type="button" onClick={checkUserId}>
                  중복 확인
                </CheckButton>
              </FieldRow>

              {isUserIdChecked && <SuccessMessage>사용 가능한 아이디입니다.</SuccessMessage>}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="nickname">이름</FieldLabel>

              <FieldRow>
                <UnderlinedInput>
                  <Input
                    value={nickname}
                    onChange={(event) => handleNicknameChange(event.target.value)}
                    placeholder="프로필 이름 입력"
                    size="md"
                    width="100%"
                  />
                </UnderlinedInput>

                <CheckButton type="button" onClick={checkNickname}>
                  확인
                </CheckButton>
              </FieldRow>

              {isNicknameChecked && <SuccessMessage>사용 가능한 이름입니다.</SuccessMessage>}
            </FieldGroup>
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
  width: 340px;
  margin: 66px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[12]};
`;

const Recobot = styled.img`
  width: 32px;
  height: 32px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${tokens.fontSize.page};
  font-weight: ${tokens.fontWeight.semibold};
`;

const ProfileArea = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadButton = styled.button`
  height: 30px;
  margin-top: ${tokens.spacing[20]};
  padding: 0 14px;
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.radius.sm};
  background: ${tokens.colors.button.white};
  color: ${tokens.colors.text.light};
  font-family: inherit;
  font-size: ${tokens.fontSize.sm};
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Form = styled.div`
  width: 100%;
  margin-top: 58px;
  display: flex;
  flex-direction: column;
  gap: 34px;
`;

const FieldGroup = styled.div`
  width: 100%;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: ${tokens.spacing[8]};
  color: ${tokens.colors.text.primary};
  font-size: ${tokens.fontSize.md};
  font-weight: ${tokens.fontWeight.medium};
`;

const FieldRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${tokens.spacing[12]};
`;

const UnderlinedInput = styled.div`
  flex: 1;
  height: 42px;
  border-bottom: 1px solid ${tokens.colors.border.secondary};
`;

const CheckButton = styled.button`
  flex-shrink: 0;
  height: 34px;
  padding: 0 14px;
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.radius.sm};
  background: ${tokens.colors.button.white};
  color: ${tokens.colors.text.primary};
  font-family: inherit;
  font-size: ${tokens.fontSize.sm};
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }
`;

const SuccessMessage = styled.p`
  margin: ${tokens.spacing[8]} 0 0;
  color: ${tokens.colors.text.extraLight};
  font-size: ${tokens.fontSize.sm};
`;

const NextButton = styled.button`
  width: 130px;
  height: 42px;
  margin-top: 72px;
  border: none;
  border-radius: ${tokens.radius.sm};
  background: ${tokens.colors.button.black};
  color: ${tokens.colors.button.white};
  font-family: inherit;
  font-size: ${tokens.fontSize.md};
  cursor: pointer;

  &:disabled {
    background: ${tokens.colors.button.primary};
    color: ${tokens.colors.text.primary};
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    opacity: 0.7;
  }
`;
