import React from 'react';
import { Button, Space, Typography, Tag, Dropdown } from 'antd';
import {
  VideoCameraAddOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  YoutubeFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';

const { Title, Text } = Typography;

interface NavbarProps {
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <Text strong>{user?.username}</Text>
          <div>
            <Tag color="blue" style={{ marginTop: 4 }}>{user?.role || 'USER'}</Tag>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
        background: '#ffffff',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10 }}
        onClick={() => navigate('/')}
      >
        <YoutubeFilled style={{ fontSize: 32, color: '#ff0000' }} />
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2, color: '#1a1a1a' }}>
            WatchLater
          </Title>
          <Text type="secondary" style={{ fontSize: 11 }}>
            YouTube 영상 공유 게시판
          </Text>
        </div>
      </div>

      <Space size="middle">
        {isAuthenticated ? (
          <>
            <Button
              type="primary"
              danger
              icon={<VideoCameraAddOutlined />}
              onClick={onOpenCreateModal}
              style={{ fontWeight: 600 }}
            >
              영상 등록
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Button icon={<UserOutlined />} shape="round">
                {user?.username} 님
              </Button>
            </Dropdown>
          </>
        ) : (
          <>
            <Button
              type="default"
              icon={<VideoCameraAddOutlined />}
              onClick={() => navigate('/login')}
            >
              영상 등록
            </Button>
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              로그인
            </Button>
          </>
        )}
      </Space>
    </header>
  );
};
