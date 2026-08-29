import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { postGoogleLogin } from '@/api/auth';
import { setRefreshToken, useAuthStore } from '@/store/authStore';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { type: 'standard' | 'icon'; width?: number },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// 커스텀 디자인 버튼을 그대로 쓰기 위해, 구글 공식 버튼은 투명하게 렌더링해서
// 커스텀 버튼 위에 겹쳐두는 방식 사용 (loginEntry.tsx에서 위치를 겹침).
// 이렇게 해야 실제 사용자 클릭이 구글 버튼에 직접 전달되어 팝업이 안정적으로 뜸.
export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    if (!window.google || !buttonContainerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const result = await postGoogleLogin(credential);

          setAccessToken(result.accessToken);
          setRefreshToken(result.refreshToken);

          navigate(result.profileCompleted ? '/' : '/profile-setup', { replace: true });
        } catch (error) {
          // TODO(2차): 로그인 실패 UI 처리
          console.error('구글 로그인 실패', error);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonContainerRef.current, {
      type: 'standard',
      width: 280,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { buttonContainerRef };
};
