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
    userIdStatus,
    userIdMessage,
    isCheckingUserId,
    isSubmitting,
    isUploadingImage,
    isNextEnabled,
    handleUserIdChange,
    handleNicknameChange,
    handleProfileImageSelect,
    checkUserId,
    confirmNickname,
    submitProfileSetup,
  } = useProfileSetup();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    handleProfileImageSelect(file);
  };

  const handleNext = async () => {
    const isSuccess = await submitProfileSetup();

    if (isSuccess) {
      navigate('/');
    }
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

            <UploadButton
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingImage ? '업로드 중' : '이미지 업로드'}
            </UploadButton>

            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
            />
          </ProfileArea>

          <Form>
            <FieldGroup>
              <FieldLabel>아이디</FieldLabel>

              <FieldRow>
                <UnderlinedInput>
                  <Input
                    value={userId}
                    onChange={(event) => handleUserIdChange(event.target.value)}
                    placeholder="영문, 숫자, 언더바 2~20자"
                    size="md"
                    width="100%"
                  />
                </UnderlinedInput>

                <CheckButton type="button" disabled={isCheckingUserId} onClick={checkUserId}>
                  {isCheckingUserId ? '확인 중' : '중복 확인'}
                </CheckButton>
              </FieldRow>

              {userIdStatus === 'available' && (
                <SuccessMessage aria-live="polite">{userIdMessage}</SuccessMessage>
              )}

              {userIdStatus === 'duplicate' && (
                <ErrorMessage aria-live="polite">{userIdMessage}</ErrorMessage>
              )}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>이름</FieldLabel>

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

                <CheckButton type="button" onClick={confirmNickname}>
                  확인
                </CheckButton>
              </FieldRow>
            </FieldGroup>
          </Form>

          <NextButton type="button" disabled={!isNextEnabled} onClick={handleNext}>
            {isSubmitting ? '저장 중' : '다음'}
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
  margin: 58px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[16]};
  transform: translateY(-8px);
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
  margin-top: 66px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadButton = styled.button`
  height: 26px;
  margin-top: ${tokens.spacing[20]};
  padding: 0 12px;
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.radius.sm};
  background: ${tokens.colors.button.white};
  color: ${tokens.colors.text.primary};
  font-family: inherit;
  font-size: ${tokens.fontSize.sm};
  font-weight: ${tokens.fontWeight.regular};
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  &:not(:disabled):active {
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

const FieldLabel = styled.span`
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

  input::placeholder {
    color: ${tokens.colors.text.placeholder};
  }
`;

const CheckButton = styled.button`
  flex-shrink: 0;
  height: 30px;
  padding: 0 12px;
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.radius.sm};
  background: ${tokens.colors.button.white};
  color: ${tokens.colors.text.primary};
  font-family: inherit;
  font-size: ${tokens.fontSize.sm};
  font-weight: ${tokens.fontWeight.regular};
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  &:not(:disabled):active {
    opacity: 0.6;
  }
`;

const Message = styled.p`
  margin: ${tokens.spacing[8]} 0 0;
  font-size: ${tokens.fontSize.sm};
`;

const SuccessMessage = styled(Message)`
  color: ${tokens.colors.text.extraLight};
`;

const ErrorMessage = styled(Message)`
  color: ${tokens.colors.text.error};
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
  font-weight: ${tokens.fontWeight.regular};
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
