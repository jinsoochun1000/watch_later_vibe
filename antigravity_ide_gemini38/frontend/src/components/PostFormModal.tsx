import React, { useEffect, useState } from 'react';
import type { WatchLaterItem, WatchLaterCreateInput, WatchLaterUpdateInput } from '../types';
import { Modal, Form, Input, Radio, Button, message, Alert } from 'antd';
import { Youtube, Type, AlignLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

interface PostFormModalProps {
  open: boolean;
  item: WatchLaterItem | null; // null for Create, WatchLaterItem for Edit
  onClose: () => void;
  onSuccess: () => void;
}

export const PostFormModal: React.FC<PostFormModalProps> = ({
  open,
  item,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const isEdit = !!item;

  useEffect(() => {
    if (open) {
      if (item) {
        form.setFieldsValue({
          title: item.title,
          videoUrl: item.videoUrl,
          content: item.content,
          watchYn: item.watchYn,
        });
        setPreviewId(item.youtubeVideoId);
      } else {
        form.resetFields();
        form.setFieldsValue({
          watchYn: 'N',
        });
        setPreviewId(null);
      }
    }
  }, [open, item, form]);

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const pattern =
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(pattern);
    return match ? match[1] : null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const yId = extractYoutubeId(val);
    setPreviewId(yId);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isEdit && item) {
        const updateData: WatchLaterUpdateInput = {
          title: values.title.trim(),
          videoUrl: values.videoUrl.trim(),
          content: values.content || '',
          watchYn: values.watchYn || 'N',
        };
        await api.updatePost(item.postId, updateData);
        message.success('게시물이 성공적으로 수정되었습니다.');
      } else {
        const createData: WatchLaterCreateInput = {
          title: values.title.trim(),
          videoUrl: values.videoUrl.trim(),
          content: values.content || '',
          watchYn: values.watchYn || 'N',
        };
        await api.createPost(createData);
        message.success('새 게시물이 성공적으로 등록되었습니다.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || '저장 중 오류가 발생했습니다.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Youtube size={22} color="#ff0033" />
          <span>{isEdit ? '게시물 내용 수정' : '새 YouTube 영상 메모 등록'}</span>
        </div>
      }
      width={600}
      centered
      destroyOnClose
    >
      <div style={{ padding: '8px 0 16px 0' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="영상 제목"
            name="title"
            rules={[
              { required: true, message: '제목을 입력해주세요.' },
              { max: 200, message: '제목은 200자 이하여야 합니다.' },
            ]}
          >
            <Input
              id="input-post-title"
              prefix={<Type size={16} color="#94a3b8" style={{ marginRight: 6 }} />}
              placeholder="예: 리액트 19 & 스프링 부트 3 최신 강좌"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="YouTube 영상 URL"
            name="videoUrl"
            rules={[
              { required: true, message: 'YouTube URL을 입력해주세요.' },
              { max: 500, message: 'URL은 500자 이하여야 합니다.' },
            ]}
          >
            <Input
              id="input-post-url"
              prefix={<Youtube size={16} color="#ff0033" style={{ marginRight: 6 }} />}
              placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
              size="large"
              onChange={handleUrlChange}
            />
          </Form.Item>

          {/* Real-time YouTube Thumbnail Preview */}
          {previewId && (
            <div
              style={{
                marginBottom: 18,
                padding: 10,
                borderRadius: 10,
                background: 'rgba(255, 0, 51, 0.05)',
                border: '1px solid rgba(255, 0, 51, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <img
                src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
                alt="미리보기"
                style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 6 }}
              />
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>✓ 영상 ID 감지 성공:</span> {previewId}
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  등록 시 동영상 썸네일과 인라인 플레이어가 자동으로 지원됩니다.
                </div>
              </div>
            </div>
          )}

          <Form.Item label="신규 / 완료 구분" name="watchYn">
            <Radio.Group buttonStyle="solid" id="radio-post-status">
              <Radio.Button value="N" style={{ marginRight: 8, borderRadius: 8 }}>
                신규 (미시청)
              </Radio.Button>
              <Radio.Button value="Y" style={{ borderRadius: 8 }}>
                완료 (시청완료)
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="메모 내용" name="content">
            <Input.TextArea
              id="input-post-content"
              rows={4}
              placeholder="나중에 볼 이유, 핵심 타임스탬프, 요약 메모를 작성하세요..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>
              취소
            </Button>
            <Button
              id="btn-submit-post"
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CheckCircle2 size={16} />}
              style={{
                borderRadius: 8,
                height: 40,
                padding: '0 24px',
              }}
            >
              {isEdit ? '수정 저장' : '게시물 등록'}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
