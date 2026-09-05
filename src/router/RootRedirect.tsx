import { Navigate } from 'react-router-dom';

import HomePage from '@/pages/HomePage';
import { useAuthStore } from '@/store/authStore';

function RootRedirect() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <HomePage /> : <Navigate to="/login" replace />;
}

export default RootRedirect;
