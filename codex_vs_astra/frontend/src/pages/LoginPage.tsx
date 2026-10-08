import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Alert, Button, Form, Input } from 'antd';
import { ArrowLeftOutlined, LockOutlined, PlayCircleFilled, UserOutlined } from '@ant-design/icons';
import { login, errorMessage } from '../api';
import { useAuth } from '../auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { username, ready } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (username) return <Navigate to="/" replace />;
  return <main className="login-page"><section className="login-story">
    <Link to="/" className="brand"><PlayCircleFilled /> WATCH LATER</Link>
    <div><span className="eyebrow">A LITTLE INSPIRATION, EVERY DAY</span><h1>좋은 영상은,<br />함께 볼 때 더 좋아요.</h1><p>발견한 영상을 모으고, 생각을 나누고.<br />우리의 다음 영감을 이곳에서 시작하세요.</p></div>
    <span className="story-bottom">SAVE IT. WATCH IT. SHARE IT.</span>
  </section><section className="login-form"><Link to="/" className="back-link"><ArrowLeftOutlined /> 게시판으로 돌아가기</Link>
    <div className="login-box"><span className="eyebrow">WELCOME BACK</span><h2>로그인</h2><p className="muted">로그인하고 나누고 싶은 영상을 등록해 보세요.</p>
      {error && <Alert title={error} type="error" showIcon className="form-alert" />}
      <Form layout="vertical" onFinish={async (values: { username: string; password: string }) => {
        setBusy(true); setError('');
        try { await login(values.username, values.password); navigate('/'); }
        catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
      }}>
        <Form.Item name="username" label="아이디" rules={[{ required: true, whitespace: true, message: '아이디를 입력해 주세요.' }]}><Input size="large" prefix={<UserOutlined />} autoComplete="username" maxLength={50} placeholder="아이디" /></Form.Item>
        <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}><Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" maxLength={100} placeholder="비밀번호" /></Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={busy} disabled={!ready}>로그인</Button>
      </Form><p className="login-note">계정은 게시판 관리자에게 문의해 주세요.</p>
    </div>
  </section></main>;
}
