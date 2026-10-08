import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { App as AntApp, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Board } from './pages/Board';
import { LoginPage } from './pages/LoginPage';
import { restoreSession } from './api';
import './style.css';

ModuleRegistry.registerModules([AllCommunityModule]);
const client = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15000 } } });
void restoreSession().catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ConfigProvider locale={koKR} theme={{ token: { colorPrimary: '#4f63ed', borderRadius: 10, fontFamily: '"Segoe UI", "Malgun Gothic", sans-serif' } }}>
    <AntApp><QueryClientProvider client={client}><BrowserRouter><Routes>
      <Route path="/" element={<Board />} /><Route path="/login" element={<LoginPage />} /><Route path="*" element={<Navigate to="/" replace />} />
    </Routes></BrowserRouter></QueryClientProvider></AntApp>
  </ConfigProvider></React.StrictMode>,
);
