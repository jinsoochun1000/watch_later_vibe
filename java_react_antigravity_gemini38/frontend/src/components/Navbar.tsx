import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Button, Dropdown, MenuProps, Tag } from 'antd';
import { 
  Play, 
  PlusCircle, 
  LogIn, 
  LogOut, 
  User, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenCreate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onOpenCreate }) => {
  const { user, logout } = useAuthStore();

  const userMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{user?.userNm}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>@{user?.loginId}</div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'swagger',
      icon: <ExternalLink size={14} />,
      label: (
        <a href="/swagger-ui.html" target="_blank" rel="noopener noreferrer">
          Swagger API 문서
        </a>
      ),
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={14} />,
      label: '로그아웃',
      onClick: logout,
    },
  ];

  return (
    <header className="navbar">
      <div className="logo-section" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="logo-icon-wrapper">
          <Play size={22} fill="white" />
        </div>
        <div className="logo-title-group">
          <span className="logo-brand">WatchLater</span>
          <span className="logo-subtitle">YouTube 공유 메모 보드</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a 
          href="/swagger-ui.html" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#94a3b8',
            fontSize: '0.88rem',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            transition: 'all 0.2s',
          }}
          className="api-doc-link"
        >
          <BookOpen size={15} />
          <span>API 명세</span>
        </a>

        {user ? (
          <>
            <Button
              id="btn-create-post"
              type="primary"
              icon={<PlusCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
              onClick={onOpenCreate}
              style={{
                height: 40,
                padding: '0 18px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              새 영상 등록
            </Button>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div
                id="user-profile-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '5px 12px',
                  borderRadius: 24,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {user.userNm.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    {user.userNm}
                  </span>
                  <Tag color="cyan" style={{ fontSize: '0.65rem', lineHeight: '14px', margin: 0, padding: '0 4px', width: 'fit-content' }}>
                    온라인
                  </Tag>
                </div>
              </div>
            </Dropdown>
          </>
        ) : (
          <Button
            id="btn-open-login"
            type="primary"
            icon={<LogIn size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
            onClick={onOpenLogin}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            로그인
          </Button>
        )}
      </div>
    </header>
  );
};
