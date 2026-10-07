import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Avatar from '@/components/common/Avatar';
import ErrorState from '@/components/common/ErrorState';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import { tokens } from '@/styles/tokens';
import {
    deleteProfileImage,
    getCheckLoginId,
    getMe,
    putProfileImage,
    updateMe,
} from '@/api/member';
import { useMyProfileStore } from '@/store/myProfileStore';
import { USER_ID_REGEX, USER_ID_FORMAT_MESSAGE } from '@/utils/validators';

type UserIdCheckStatus = 'idle' | 'available' | 'duplicate';

function EditProfileBoard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isBusyRef = useRef(false);
    const setProfile = useMyProfileStore((state) => state.setProfile);
    const patchProfile = useMyProfileStore((state) => state.patchProfile);

    const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

    const [nickname, setNickname] = useState('');
    const [nicknameInput, setNicknameInput] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    const [userId, setUserId] = useState('');
    const [userIdInput, setUserIdInput] = useState('');
    const [isEditingUserId, setIsEditingUserId] = useState(false);
    const [userIdCheckStatus, setUserIdCheckStatus] = useState<UserIdCheckStatus>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [failedMessage, setFailedMessage] = useState<string | null>(null);

    useEffect(() => {
        getMe()
            .then((me) => {
                setLoadError(null);
                setProfile(me);
                setProfileImageUrl(me.profileImageUrl ?? undefined);
                setNickname(me.nickname);
                setNicknameInput(me.nickname);
                setUserId(me.loginId);
                setUserIdInput(me.loginId);
                setIsLoading(false);
            })
            .catch(() => setLoadError('내 정보를 불러오지 못했어요'));
    }, [retryCount, setProfile]);

    // 연타로 같은 요청이 여러 번 나가는 걸 막고, 실패하면 안내 모달을 띄움
    const runGuarded = async (action: () => Promise<void>, failMessage: string) => {
        if (isBusyRef.current) return;
        isBusyRef.current = true;
        try {
            await action();
        } catch {
            setFailedMessage(failMessage);
        } finally {
            isBusyRef.current = false;
        }
    };

    const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // 같은 파일을 다시 골라도 change 이벤트가 나도록 비워줌
        event.target.value = '';
        if (!file) return;

        runGuarded(async () => {
            const { profileImageUrl: newUrl } = await putProfileImage(file);
            setProfileImageUrl(newUrl);
            patchProfile({ profileImageUrl: newUrl });
        }, '이미지 변경에 실패했어요.\n다시 시도해주세요');
    };

    const handleDeleteImage = () => {
        runGuarded(async () => {
            await deleteProfileImage();
            setProfileImageUrl(undefined);
            patchProfile({ profileImageUrl: null });
        }, '이미지 삭제에 실패했어요.\n다시 시도해주세요');
    };

    const handleStartEditName = () => {
        setIsEditingName(true);
    };

    const handleSaveNickname = () => {
        const trimmed = nicknameInput.trim();
        if (!trimmed) return;

        runGuarded(async () => {
            const updated = await updateMe({ nickname: trimmed });
            setNickname(updated.nickname);
            setNicknameInput(updated.nickname);
            setIsEditingName(false);
            patchProfile({ nickname: updated.nickname });
        }, '닉네임 변경에 실패했어요.\n다시 시도해주세요');
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

    const handleCheckUserIdDuplicate = () => {
        const trimmed = userIdInput.trim();
        if (!USER_ID_REGEX.test(trimmed)) return;

        runGuarded(async () => {
            const { available } = await getCheckLoginId(trimmed);
            setUserIdCheckStatus(available ? 'available' : 'duplicate');
        }, '중복 확인에 실패했어요.\n다시 시도해주세요');
    };

    const handleSaveUserId = () => {
        if (!canSaveUserId) return;

        runGuarded(async () => {
            const updated = await updateMe({ loginId: userIdInput.trim() });
            setUserId(updated.loginId);
            setUserIdInput(updated.loginId);
            setUserIdCheckStatus('idle');
            setIsEditingUserId(false);
            patchProfile({ loginId: updated.loginId });
        }, '아이디 변경에 실패했어요.\n다시 시도해주세요');
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

    if (loadError) {
        return (
            <ErrorState
                title={loadError}
                description="잠시 후 다시 시도해주세요"
                actionLabel="다시 시도"
                onAction={() => setRetryCount((count) => count + 1)}
                minHeight="480px"
                size="lg"
            />
        );
    }

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

            <Modal
                type="confirm"
                isOpen={failedMessage !== null}
                onClose={() => setFailedMessage(null)}
                message={failedMessage ?? ''}
                cancelText="닫기"
            />
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
