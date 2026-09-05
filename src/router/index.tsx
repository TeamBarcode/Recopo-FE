import { createBrowserRouter } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import RootRedirect from '@/router/RootRedirect';
import FriendsPage from '@/pages/FriendsPage';
import IdeaPage from '@/pages/IdeaPage';
import IdeaDetailPage from '@/pages/IdeaDetailPage';
import EditIdeaPage from '@/pages/EditIdeaPage';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import EditProfilePage from '@/pages/EditProfilePage';
import LikedIdeasPage from '@/pages/LikedIdeasPage';
import SignupPage from '@/pages/SignupPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';
import RecordPage from '@/pages/RecordPage';
import BrainstormDetailPage from '@/pages/BrainstormDetailPage';
import EditRecordPage from '@/pages/EditRecordPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <RootRedirect />,
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
        path: '/ideas/:ideaId/edit',
        element: <EditIdeaPage />,
      },
      {
        path: '/friends',
        element: <FriendsPage />,
      },
      {
        path: '/mypage',
        element: <MyPage />,
      },
      {
        path: '/mypage/edit',
        element: <EditProfilePage />,
      },
      {
        path: '/mypage/liked',
        element: <LikedIdeasPage />,
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
