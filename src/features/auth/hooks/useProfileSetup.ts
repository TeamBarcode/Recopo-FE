import { useState } from 'react';
import axios from 'axios';

import { getCheckLoginId, patchProfileSetup, putProfileImage } from '@/api/member';

type UserIdStatus = 'idle' | 'available' | 'duplicate';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return fallback;
};

export const useProfileSetup = () => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [userIdStatus, setUserIdStatus] = useState<UserIdStatus>('idle');
  const [userIdMessage, setUserIdMessage] = useState('');
  const [isNicknameConfirmed, setIsNicknameConfirmed] = useState(false);

  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleUserIdChange = (value: string) => {
    setUserId(value);
    setUserIdStatus('idle');
    setUserIdMessage('');
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setIsNicknameConfirmed(false);
  };

  // 프로필 사진은 PATCH 제출에 안 실리고, 선택 즉시 별도 API로 바로 업로드됨
  const handleProfileImageSelect = async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      // TODO(2차): 형식/용량 제한 안내 UI
      console.error('프로필 사진은 jpg/jpeg/png/webp, 5MB 이하만 가능해요');
      return;
    }

    setProfileImage(URL.createObjectURL(file)); // 업로드 완료 전까지 보여줄 즉시 미리보기
    setIsUploadingImage(true);

    try {
      const result = await putProfileImage(file);
      setProfileImage(result.profileImageUrl); // 실제 업로드 결과(S3 URL)로 교체
    } catch (error) {
      // TODO(2차): 업로드 실패 UI 처리
      console.error('프로필 사진 업로드 실패', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const checkUserId = async () => {
    const trimmedUserId = userId.trim();

    if (!trimmedUserId) {
      setUserIdStatus('duplicate');
      setUserIdMessage('아이디를 입력해주세요');
      return;
    }

    setIsCheckingUserId(true);
    setUserIdMessage('');

    try {
      const result = await getCheckLoginId(trimmedUserId);

      if (result.available) {
        setUserIdStatus('available');
        setUserIdMessage('사용 가능한 아이디예요');
      } else {
        setUserIdStatus('duplicate');
        setUserIdMessage('이미 사용 중인 아이디예요');
      }
    } catch (error) {
      setUserIdStatus('duplicate');
      setUserIdMessage(getErrorMessage(error, '아이디 확인에 실패했어요'));
    } finally {
      setIsCheckingUserId(false);
    }
  };

  const confirmNickname = () => {
    setIsNicknameConfirmed(nickname.trim() !== '');
  };

  const isNextEnabled =
    userIdStatus === 'available' && nickname.trim() !== '' && isNicknameConfirmed && !isSubmitting;

  const submitProfileSetup = async () => {
    if (!isNextEnabled) return false;

    setIsSubmitting(true);

    try {
      await patchProfileSetup({ loginId: userId.trim(), nickname: nickname.trim() });
      return true;
    } catch (error) {
      setUserIdStatus('duplicate');
      setUserIdMessage(getErrorMessage(error, '프로필 설정에 실패했어요'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    userId,
    nickname,
    profileImage,
    userIdStatus,
    userIdMessage,
    isNicknameConfirmed,
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
  };
};
