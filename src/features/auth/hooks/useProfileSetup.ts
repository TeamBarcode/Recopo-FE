import { useState } from 'react';

import { mockUser } from '@/mocks/user';

export const useProfileSetup = () => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const checkUserId = () => {
    setIsUserIdChecked(userId.trim() !== '' && userId.trim() !== mockUser.userId);
  };

  const checkNickname = () => {
    setIsNicknameChecked(nickname.trim() !== '');
  };

  const handleUserIdChange = (value: string) => {
    setUserId(value);
    setIsUserIdChecked(false);
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setIsNicknameChecked(false);
  };

  const handleProfileImageChange = (imageUrl: string | null) => {
    setProfileImage(imageUrl);
  };

  const isNextEnabled =
    userId.trim() !== '' && nickname.trim() !== '' && isUserIdChecked && isNicknameChecked;

  return {
    userId,
    nickname,
    isUserIdChecked,
    isNicknameChecked,
    profileImage,
    isNextEnabled,
    checkUserId,
    checkNickname,
    handleUserIdChange,
    handleNicknameChange,
    handleProfileImageChange,
  };
};
