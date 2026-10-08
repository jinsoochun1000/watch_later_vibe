import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoardPage } from './pages/BoardPage';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './store/authStore';
import { authApi } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    // Try restoring session via Refresh Token on initial load
    const restoreSession = async () => {
      try {
        const refreshRes = await authApi.refresh();
        if (refreshRes.success && refreshRes.data?.accessToken) {
          setAuth(refreshRes.data.accessToken, {
            username: refreshRes.data.username,
            role: refreshRes.data.role,
          });
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [setAuth, logout, setLoading]);

  return (
    <ConfigProvider
      locale={koKR}
      theme={{
        token: {
          colorPrimary: '#ff0000',
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BoardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default App;
