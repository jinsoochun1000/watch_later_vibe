import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, YoutubeFilled, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values.username, values.password);
      if (res.success && res.data) {
        message.success('로그인에 성공하였습니다.');
        setAuth(res.data.accessToken, {
          username: res.data.username,
          role: res.data.role,
        });
        navigate('/');
      } else {
        message.error(res.message || '로그인에 실패하였습니다.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || '아이디 또는 비밀번호가 일치하지 않습니다.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    form.setFieldsValue({
      username: 'stk1',
      password: 'stk1',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 20,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <YoutubeFilled style={{ fontSize: 48, color: '#ff0000' }} />
          <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
            WatchLater
          </Title>
          <Text type="secondary">YouTube 영상 공유 게시판 로그인</Text>
        </div>

        <Form
          form={form}
          name="loginForm"
          initialValues={{
            username: 'stk1',
            password: 'stk1',
          }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="아이디"
            rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="아이디 (기본값: stk1)"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="비밀번호 (기본값: stk1)"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<LoginOutlined />}
              style={{
                height: 46,
                fontWeight: 600,
                background: '#ff0000',
                borderColor: '#ff0000',
              }}
            >
              로그인
            </Button>
          </Form.Item>
        </Form>

        <Divider plain style={{ fontSize: 12, color: '#888' }}>
          테스트 기본 계정
        </Divider>

        <div
          style={{
            background: '#fafafa',
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            padding: '12px 16px',
            textAlign: 'center',
          }}
        >
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            아이디: <Text code strong>stk1</Text> / 비밀번호: <Text code strong>stk1</Text>
          </Text>
          <Space>
            <Button size="small" onClick={fillDefaultCredentials}>
              기본값 입력
            </Button>
            <Button size="small" type="link" onClick={() => navigate('/')}>
              로그인 없이 둘러보기
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};
