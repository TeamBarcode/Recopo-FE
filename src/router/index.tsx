import { createBrowserRouter } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import FriendsPage from '@/pages/FriendsPage';
import HomePage from '@/pages/HomePage';
import IdeaPage from '@/pages/IdeaPage';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import SignupPage from '@/pages/SignupPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
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
