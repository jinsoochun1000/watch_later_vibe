import { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import type { Post, PostInput } from '../types';
import { videoId } from '../youtube';

interface Props { open: boolean; post: Post | null; busy: boolean; onClose: () => void; onSave: (input: PostInput) => void }
export function PostEditor({ open, post, busy, onClose, onSave }: Props) {
  const [form] = Form.useForm<PostInput>();
  useEffect(() => {
    if (open) { form.resetFields(); form.setFieldsValue(post ? { ...post, content: post.content ?? '' } : { title: '', videoUrl: '', content: '', status: 'NEW' }); }
  }, [open, post, form]);
  return <Modal open={open} title={post ? '영상 게시물 수정' : '새로운 영상 공유'} okText={post ? '수정 저장' : '영상 등록'} cancelText="취소"
    confirmLoading={busy} closable={!busy} maskClosable={!busy} cancelButtonProps={{ disabled: busy }} onCancel={onClose} onOk={() => form.submit()} width={600}>
    <p className="muted">함께 보고 싶은 영상과 생각을 남겨 주세요.</p>
    <Form form={form} layout="vertical" onFinish={(values) => onSave({ ...values, version: post?.version })} disabled={busy}>
      <Form.Item name="title" label="제목" rules={[{ required: true, whitespace: true, message: '제목을 입력해 주세요.' }, { max: 200 }]}><Input placeholder="어떤 영상인가요?" maxLength={200} showCount /></Form.Item>
      <Form.Item name="videoUrl" label="YouTube 영상 URL" rules={[{ required: true, message: '영상 URL을 입력해 주세요.' }, { validator: (_, value: string) => !value || videoId(value) ? Promise.resolve() : Promise.reject(new Error('유효한 HTTPS YouTube 영상 주소를 입력해 주세요.')) }]}><Input placeholder="https://www.youtube.com/watch?v=..." maxLength={1000} /></Form.Item>
      <Form.Item name="status" label="시청 상태" rules={[{ required: true }]}><Select options={[{ value: 'NEW', label: '신규 · 볼 예정이에요' }, { value: 'DONE', label: '완료 · 시청했어요' }]} /></Form.Item>
      <Form.Item name="content" label="내용" rules={[{ max: 10000 }]}><Input.TextArea rows={5} placeholder="추천하는 이유나 기억하고 싶은 내용을 적어 주세요." maxLength={10000} showCount /></Form.Item>
    </Form>
  </Modal>;
}
