import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert } from 'antd';
import { User, Lock, KeyRound } from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (values: { loginId: string; userPw: string }) => {
    setLoading(true);
    try {
      const res = await api.login(values.loginId, values.userPw);
      setAuth(
        {
          userId: res.userId,
          loginId: res.loginId,
          userNm: res.userNm,
        },
        res.accessToken
      );
      message.success(`환영합니다, ${res.userNm}님!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    form.setFieldsValue({
      loginId: 'stk1',
      userPw: 'stk1',
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KeyRound size={20} color="#ff0033" />
          <span>사용자 로그인</span>
        </div>
      }
      centered
      width={420}
      destroyOnClose={false}
    >
      <div style={{ padding: '8px 0 16px 0' }}>
        <Alert
          message="기본 계정 안내"
          description={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                아이디: <strong>stk1</strong> / 비밀번호: <strong>stk1</strong>
              </span>
              <Button 
                size="small" 
                type="dashed" 
                onClick={fillDefaultCredentials}
                style={{ borderColor: '#ff0033', color: '#ff4d6d' }}
              >
                기본값 채우기
              </Button>
            </div>
          }
          type="info"
          showIcon
          style={{
            marginBottom: 20,
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
          }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ loginId: 'stk1', userPw: 'stk1' }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="로그인 아이디"
            name="loginId"
            rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
          >
            <Input
              id="login-id-input"
              prefix={<User size={16} color="#94a3b8" style={{ marginRight: 6 }} />}
              placeholder="아이디를 입력하세요"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="비밀번호"
            name="userPw"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password
              id="login-pw-input"
              prefix={<Lock size={16} color="#94a3b8" style={{ marginRight: 6 }} />}
              placeholder="비밀번호를 입력하세요"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 8 }}>
            <Button
              id="btn-submit-login"
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{
                height: 44,
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              로그인
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
