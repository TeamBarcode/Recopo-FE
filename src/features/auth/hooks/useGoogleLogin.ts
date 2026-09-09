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
const RETRY_INTERVAL_MS = 100;
const MAX_RETRY_COUNT = 50; // 100ms * 50 = 5초까지 재시도 후 포기

// 커스텀 디자인 버튼을 그대로 쓰기 위해, 구글 공식 버튼은 투명하게 렌더링해서
// 커스텀 버튼 위에 겹쳐두는 방식 사용 (loginEntry.tsx에서 위치를 겹침).
// 이렇게 해야 실제 사용자 클릭이 구글 버튼에 직접 전달되어 팝업이 안정적으로 뜸.
export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    if (!buttonContainerRef.current) return;

    let isActive = true;

    // index.html의 구글 스크립트가 async라 로딩 완료 시점이 보장되지 않으므로,
    // 마운트 시 window.google이 아직 없으면 로딩될 때까지 짧은 간격으로 재시도함.
    const tryInitialize = () => {
      if (!window.google || !buttonContainerRef.current) return false;

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

      return true;
    };

    if (tryInitialize()) return;

    let retryCount = 0;

    const intervalId = window.setInterval(() => {
      if (!isActive) return;

      if (tryInitialize()) {
        window.clearInterval(intervalId);
        return;
      }

      retryCount += 1;

      if (retryCount >= MAX_RETRY_COUNT) {
        window.clearInterval(intervalId);
        // TODO(2차): 로그인 버튼 초기화 실패 UI 처리
        console.error('구글 로그인 스크립트 로딩에 실패했어요');
      }
    }, RETRY_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { buttonContainerRef };
};
