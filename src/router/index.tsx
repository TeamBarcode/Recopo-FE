import { createBrowserRouter } from 'react-router-dom';

import FriendsPage from '@/pages/FriendsPage';
import HomePage from '@/pages/HomePage';
import IdeaPage from '@/pages/IdeaPage';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import SignupPage from '@/pages/SignupPage';

const router = createBrowserRouter([
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
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
]);

export default router;
