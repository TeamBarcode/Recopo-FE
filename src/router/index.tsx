import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import FriendsPage from '@/pages/FriendsPage';
import HomePage from '@/pages/HomePage';
import IdeaPage from '@/pages/IdeaPage';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import SignupPage from '@/pages/SignupPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';

const isLoggedIn = false; // TODO: 로그인 API 연동되면 실제 로그인 상태로 교체

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: isLoggedIn ? <HomePage /> : <Navigate to="/login" replace />,
      },
      {
        path: '/ideas',
        element: <IdeaPage />,
      },
      {
        path: '/friends',
        element: <FriendsPage />,
      },
      {
        path: '/mypage',
        element: <MyPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/profile-setup',
    element: <ProfileSetupPage />,
  },
]);

export default router;
