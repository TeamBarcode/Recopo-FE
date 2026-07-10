import { useState } from 'react';

import { fetchMockProfileSetup, type ProfileSetupErrorResponse } from '@/mocks/auth';

type UserIdStatus = 'idle' | 'available' | 'duplicate';

export const useProfileSetup = () => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [userIdStatus, setUserIdStatus] = useState<UserIdStatus>('idle');
  const [userIdMessage, setUserIdMessage] = useState('');
  const [isNicknameConfirmed, setIsNicknameConfirmed] = useState(false);

  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserIdChange = (value: string) => {
    setUserId(value);
    setUserIdStatus('idle');
    setUserIdMessage('');
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setIsNicknameConfirmed(false);
  };

  const handleProfileImageChange = (imageUrl: string | null) => {
    setProfileImage(imageUrl);
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
      await fetchMockProfileSetup({
        userId: trimmedUserId,
        nickname: nickname.trim() || 'temporary',
        profileImageUrl: profileImage ?? undefined,
      });

      setUserIdStatus('available');
      setUserIdMessage('사용 가능한 아이디예요');
    } catch (caughtError) {
      const error = caughtError as ProfileSetupErrorResponse;

      setUserIdStatus('duplicate');
      setUserIdMessage(error.message);
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
      await fetchMockProfileSetup({
        userId: userId.trim(),
        nickname: nickname.trim(),
        profileImageUrl: profileImage ?? undefined,
      });

      return true;
    } catch (caughtError) {
      const error = caughtError as ProfileSetupErrorResponse;

      setUserIdStatus('duplicate');
      setUserIdMessage(error.message);

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
    isNextEnabled,
    handleUserIdChange,
    handleNicknameChange,
    handleProfileImageChange,
    checkUserId,
    confirmNickname,
    submitProfileSetup,
  };
};
