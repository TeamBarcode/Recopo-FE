import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import FriendsPage from '@/pages/FriendsPage';
import HomePage from '@/pages/HomePage';
import IdeaPage from '@/pages/IdeaPage';
import IdeaDetailPage from '@/pages/IdeaDetailPage';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import SignupPage from '@/pages/SignupPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';
import RecordPage from '@/pages/RecordPage';
import BrainstormDetailPage from '@/pages/BrainstormDetailPage';
import EditRecordPage from '@/pages/EditRecordPage';

const isLoggedIn = true; // TODO: 로그인 API 연동되면 실제 로그인 상태로 교체

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: isLoggedIn ? <HomePage /> : <Navigate to="/login" replace />,
      },
      {
        path: '/record',
        element : <RecordPage />,
      },
      {
        path: '/brainstorm/:cardId',
        element: <BrainstormDetailPage />,
      },
      {
        path: '/brainstorm/:cardId/edit',
        element: <EditRecordPage />,
      },
      {
        path: '/ideas',
        element: <IdeaPage />,
      },
      {
        path: '/ideas/:ideaId',
        element: <IdeaDetailPage />,
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
