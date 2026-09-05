import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from '@/router'
import { refreshAccessToken } from '@/api/client'
import { getRefreshToken } from '@/store/authStore'

function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (getRefreshToken()) {
        try {
          await refreshAccessToken()
        } catch {
          // refreshToken도 만료/무효 — 로그인 안 된 상태로 진행
        }
      }
      setIsBootstrapping(false)
    }

    bootstrap()
  }, [])

  // TODO(2차): 로딩 스피너로 교체
  if (isBootstrapping) return null

  return <RouterProvider router={router} />
}

export default App
