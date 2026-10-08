import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Radio, Typography, Alert, Space } from 'antd';
import { YoutubeOutlined } from '@ant-design/icons';
import type { Post, PostCreatePayload, PostUpdatePayload } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

interface PostModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Post | null;
  onCancel: () => void;
  onSubmit: (values: PostCreatePayload | PostUpdatePayload) => Promise<void>;
  loading: boolean;
}

const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

export const PostModal: React.FC<PostModalProps> = ({
  open,
  mode,
  initialData,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        form.setFieldsValue({
          title: initialData.title,
          videoUrl: initialData.videoUrl,
          content: initialData.content,
          status: initialData.status,
        });
        setPreviewVideoId(extractYoutubeId(initialData.videoUrl));
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 'NEW' });
        setPreviewVideoId(null);
      }
    }
  }, [open, mode, initialData, form]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const vid = extractYoutubeId(url);
    setPreviewVideoId(vid);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (err) {
      // Form validation error
    }
  };

  return (
    <Modal
      title={
        <Space>
          <YoutubeOutlined style={{ color: '#ff0000', fontSize: 20 }} />
          <span>{mode === 'create' ? '새 YouTube 영상 등록' : '영상 게시물 수정'}</span>
        </Space>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={mode === 'create' ? '등록하기' : '수정완료'}
      cancelText="취소"
      width={680}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'NEW' }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="title"
          label="영상 제목"
          rules={[{ required: true, message: '영상 제목을 입력해주세요.' }]}
        >
          <Input placeholder="예: 스프링 부트 3 핵심 가이드 정리" maxLength={200} showCount />
        </Form.Item>

        <Form.Item
          name="videoUrl"
          label="YouTube 영상 URL"
          rules={[
            { required: true, message: '영상 URL을 입력해주세요.' },
            {
              pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
              message: '올바른 YouTube URL 형식을 입력해주세요.',
            },
          ]}
        >
          <Input
            placeholder="예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
            onChange={handleUrlChange}
          />
        </Form.Item>

        {previewVideoId && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              미리보기 영상:
            </Text>
            <div style={{ position: 'relative', paddingBottom: '45%', height: 0, overflow: 'hidden', borderRadius: 8, background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoId}`}
                title="Preview"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>
          </div>
        )}

        <Form.Item
          name="status"
          label="상태 구분"
          rules={[{ required: true, message: '상태를 선택해주세요.' }]}
        >
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="NEW">신규 (시청 전)</Radio.Button>
            <Radio.Button value="COMPLETED">완료 (시청 완료)</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="content"
          label="영상 내용 / 메모"
        >
          <TextArea
            rows={4}
            placeholder="영상 요약 내용, 타임스탬프, 학습 메모 등을 자유롭게 작성하세요."
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
