import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Avatar from '@/components/common/Avatar';
import Loading from '@/components/common/Loading';
import { tokens } from '@/styles/tokens';
import {
    fetchMockMyPageSummary,
    updateMockNickname,
    updateMockUserId,
    checkMockUserIdDuplicate,
    deleteMockProfileImage,
    updateMockProfileImage,
} from '@/mocks/mypage';

type UserIdCheckStatus = 'idle' | 'available' | 'duplicate';

const USER_ID_REGEX = /^[a-zA-Z0-9_]{2,20}$/;
const USER_ID_FORMAT_MESSAGE = '영문, 숫자, 언더바만 허용하며 2~20자 이내로 입력해주세요';

function EditProfileBoard() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

    const [nickname, setNickname] = useState('');
    const [nicknameInput, setNicknameInput] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    const [userId, setUserId] = useState('');
    const [userIdInput, setUserIdInput] = useState('');
    const [isEditingUserId, setIsEditingUserId] = useState(false);
    const [userIdCheckStatus, setUserIdCheckStatus] = useState<UserIdCheckStatus>('idle');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMockMyPageSummary().then((summary) => {
            setProfileImageUrl(summary.profileImageUrl);
            setNickname(summary.nickname);
            setNicknameInput(summary.nickname);
            setUserId(summary.userId);
            setUserIdInput(summary.userId);
            setIsLoading(false);
        });
    }, []);

    const handleChangeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        await updateMockProfileImage(objectUrl);
        setProfileImageUrl(objectUrl);
    };

    const handleDeleteImage = async () => {
        await deleteMockProfileImage();
        setProfileImageUrl(undefined);
    };

    const handleStartEditName = () => {
        setIsEditingName(true);
    };

    const handleSaveNickname = async () => {
        const trimmed = nicknameInput.trim();
        if (!trimmed) return;

        const updated = await updateMockNickname({ nickname: trimmed });
        setNickname(updated.nickname);
        setNicknameInput(updated.nickname);
        setIsEditingName(false);
    };

    const handleCancelNickname = () => {
        setNicknameInput(nickname);
        setIsEditingName(false);
    };

    const userIdFormatValid = USER_ID_REGEX.test(userIdInput.trim());
    const canSaveUserId = userIdFormatValid && userIdCheckStatus === 'available';

    const handleStartEditUserId = () => {
        setIsEditingUserId(true);
    };

    const handleUserIdInputChange = (value: string) => {
        setUserIdInput(value);
        setUserIdCheckStatus('idle');
    };

    const handleCheckUserIdDuplicate = async () => {
        const trimmed = userIdInput.trim();
        if (!USER_ID_REGEX.test(trimmed)) return;

        const { isDuplicate } = await checkMockUserIdDuplicate(trimmed);
        setUserIdCheckStatus(isDuplicate ? 'duplicate' : 'available');
    };

    const handleSaveUserId = async () => {
        if (!canSaveUserId) return;

        const updated = await updateMockUserId({ userId: userIdInput.trim() });
        setUserId(updated.userId);
        setUserIdInput(updated.userId);
        setUserIdCheckStatus('idle');
        setIsEditingUserId(false);
    };

    const handleCancelUserId = () => {
        setUserIdInput(userId);
        setUserIdCheckStatus('idle');
        setIsEditingUserId(false);
    };

    const userIdErrorMessage = !userIdFormatValid
        ? USER_ID_FORMAT_MESSAGE
        : userIdCheckStatus === 'duplicate'
        ? '아이디가 중복이에요'
        : '';

    if (isLoading) return <Loading minHeight="480px" />;

    return (
        <Wrapper>
            <Title>프로필 수정</Title>

            <ProfileBox>
                <Avatar src={profileImageUrl} size="lg" />

                <ProfileRight>
                    <ProfileName>{nickname}</ProfileName>
                    <ButtonRow>
                        <ChangeImageButton type="button" onClick={() => fileInputRef.current?.click()}>
                            이미지 변경
                        </ChangeImageButton>
                        <DeleteImageButton type="button" onClick={handleDeleteImage}>
                            삭제
                        </DeleteImageButton>
                        <HiddenFileInput
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleChangeImage}
                        />
                    </ButtonRow>
                </ProfileRight>
            </ProfileBox>

            <InfoHeading>프로필 정보</InfoHeading>

            <FieldGroup>
                <FieldLabel>프로필 이름</FieldLabel>
                <FieldInputRow>
                    <FieldValue
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        readOnly={!isEditingName}
                    />
                    {!isEditingName && (
                        <ChangeButton type="button" onClick={handleStartEditName}>
                            변경
                        </ChangeButton>
                    )}
                </FieldInputRow>
                <FieldDivider />
                {isEditingName && (
                    <ButtonGroupRow>
                        <CancelButton type="button" onClick={handleCancelNickname}>
                            취소
                        </CancelButton>
                        <SaveButton type="button" disabled={!nicknameInput.trim()} onClick={handleSaveNickname}>
                            저장
                        </SaveButton>
                    </ButtonGroupRow>
                )}
            </FieldGroup>

            <FieldGroup>
                <FieldLabel>아이디</FieldLabel>
                <FieldInputRow>
                    <AtPrefix>@</AtPrefix>
                    <FieldValue
                        value={userIdInput}
                        onChange={(e) => handleUserIdInputChange(e.target.value)}
                        readOnly={!isEditingUserId}
                    />
                    {!isEditingUserId && (
                        <ChangeButton type="button" onClick={handleStartEditUserId}>
                            변경
                        </ChangeButton>
                    )}
                    {isEditingUserId && (
                        <DuplicateCheckButton
                            type="button"
                            $status={userIdCheckStatus}
                            disabled={!userIdFormatValid}
                            onClick={handleCheckUserIdDuplicate}
                        >
                            중복 확인
                        </DuplicateCheckButton>
                    )}
                </FieldInputRow>
                <FieldDivider />
                {userIdErrorMessage && <ErrorMessage>{userIdErrorMessage}</ErrorMessage>}
                {isEditingUserId && (
                    <ButtonGroupRow>
                        <CancelButton type="button" onClick={handleCancelUserId}>
                            취소
                        </CancelButton>
                        <SaveButton type="button" disabled={!canSaveUserId} onClick={handleSaveUserId}>
                            저장
                        </SaveButton>
                    </ButtonGroupRow>
                )}
            </FieldGroup>
        </Wrapper>
    );
}

export default EditProfileBoard;

const Wrapper = styled.div`
    padding-top : 24px;
    display : flex;
    flex-direction : column;
    align-items : center;
`;

const Title = styled.h1`
    width : 662px;
    margin : 0 0 50px;
    font-size : ${tokens.fontSize.page};
    font-weight : ${tokens.fontWeight.semibold};
    text-align : center;
`;

const ProfileBox = styled.div`
    width : 662px;
    height : 130px;
    box-sizing : border-box;
    border : 1px solid #E5E5E5;
    border-radius : 10px;
    padding : 0 38px;
    display : flex;
    align-items : center;
    gap : 18px;
`;

const ProfileRight = styled.div`
    display : flex;
    flex-direction : column;
    gap : 10px;
`;

const ProfileName = styled.div`
    font-size : ${tokens.fontSize.xl};
    font-weight : ${tokens.fontWeight.medium};
`;

const ButtonRow = styled.div`
    display : flex;
    align-items : center;
    gap : 10px;
`;

const ChangeImageButton = styled.button`
    width : 70px;
    height : 28px;
    box-sizing : border-box;
    border : 1px solid #EBEBEB;
    border-radius : 10px;
    background : #FFFFFF;
    font-size : ${tokens.fontSize.sm};
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:active {
        opacity : 0.6;
    }
`;

const DeleteImageButton = styled.button`
    width : 39px;
    height : 28px;
    box-sizing : border-box;
    border : 1px solid #EBEBEB;
    border-radius : 10px;
    background : #FFFFFF;
    font-size : ${tokens.fontSize.sm};
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:active {
        opacity : 0.6;
    }
`;

const HiddenFileInput = styled.input`
    display : none;
`;

const InfoHeading = styled.h2`
    width : 662px;
    margin : 34px 0 0;
    font-size : 17px;
    font-weight : ${tokens.fontWeight.semibold};
`;

const FieldGroup = styled.div`
    width : 662px;
    margin-top : 34px;
`;

const FieldLabel = styled.div`
    margin-bottom : 17px;
    font-size : ${tokens.fontSize.sm};
    font-weight : ${tokens.fontWeight.regular};
    color : #7F7F7F;
`;

const FieldValue = styled.input`
    flex : 1;
    min-width : 0;
    border : none;
    outline : none;
    background : none;
    padding : 0 0 8px;
    font-family : inherit;
    font-size : ${tokens.fontSize.lg};
    font-weight : ${tokens.fontWeight.regular};
    color : ${tokens.colors.text.primary};
`;

const FieldInputRow = styled.div`
    display : flex;
    align-items : center;
    gap : 2px;
`;

const AtPrefix = styled.span`
    flex-shrink : 0;
    padding-bottom : 8px;
    font-size : ${tokens.fontSize.lg};
    font-weight : ${tokens.fontWeight.regular};
    color : ${tokens.colors.text.primary};
`;

const ChangeButton = styled.button`
    flex-shrink : 0;
    width : 39px;
    height : 28px;
    margin-right : 9px;
    margin-bottom : 8px;
    box-sizing : border-box;
    border : 1px solid #EBEBEB;
    border-radius : 10px;
    background : #FFFFFF;
    font-size : ${tokens.fontSize.sm};
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:active {
        opacity : 0.6;
    }
`;

const DuplicateCheckButton = styled.button<{ $status : UserIdCheckStatus }>`
    flex-shrink : 0;
    width : 70px;
    height : 28px;
    margin-right : 9px;
    margin-bottom : 8px;
    box-sizing : border-box;
    border : 1px solid ${({ $status }) =>
        $status === 'duplicate' ? '#FF7D7D' : $status === 'available' ? '#8CD594' : '#E5E5E5'};
    border-radius : 8px;
    background : #FFFFFF;
    color : ${tokens.colors.text.primary};
    font-size : ${tokens.fontSize.sm};
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:disabled {
        cursor : not-allowed;
        opacity : 0.5;
    }

    &:not(:disabled):active {
        opacity : 0.6;
    }
`;

const FieldDivider = styled.div`
    width : 100%;
    height : 1px;
    background : ${tokens.colors.border.secondary};
`;

const ErrorMessage = styled.div`
    margin-top : 8px;
    font-size : ${tokens.fontSize.sm};
    color : ${tokens.colors.text.error};
`;

const ButtonGroupRow = styled.div`
    margin-top : 12px;
    display : flex;
    justify-content : center;
    gap : 27px;
`;

const CancelButton = styled.button`
    width : 70px;
    height : 28px;
    box-sizing : border-box;
    border : 1px solid #E5E5E5;
    border-radius : 8px;
    background : #FFFFFF;
    color : ${tokens.colors.text.primary};
    font-size : ${tokens.fontSize.sm};
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:active {
        opacity : 0.6;
    }
`;

const SaveButton = styled.button`
    width : 70px;
    height : 28px;
    box-sizing : border-box;
    border : none;
    border-radius : 8px;
    background : #000000;
    color : #FFFFFF;
    font-size : ${tokens.fontSize.sm};
    font-weight : ${tokens.fontWeight.regular};
    cursor : pointer;

    &:disabled {
        background : #DDDDDD;
        color : ${tokens.colors.text.primary};
        cursor : not-allowed;
    }

    &:not(:disabled):active {
        opacity : 0.7;
    }
`;
