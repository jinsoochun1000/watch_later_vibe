import React from 'react';
import { Modal, Typography, Space, Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import type { Post } from '../types';

const { Title, Text, Paragraph } = Typography;

interface VideoPlayerModalProps {
  post: Post | null;
  open: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ post, open, onClose }) => {
  if (!post) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 32 }}>
          <Title level={4} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button
          key="link"
          icon={<ExportOutlined />}
          href={post.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube 새 탭에서 열기
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          닫기
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ marginTop: 16 }}>
        {post.youtubeVideoId ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, background: '#000' }}>
            <iframe
              src={`https://www.youtube.com/embed/${post.youtubeVideoId}?autoplay=1`}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
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
        ) : (
          <div style={{ padding: 24, textAlign: 'center', background: '#fafafa', borderRadius: 8 }}>
            <Text type="secondary">미리보기가 지원되지 않는 URL입니다.</Text>
            <div style={{ marginTop: 8 }}>
              <Button href={post.videoUrl} target="_blank" type="link">
                영상 바로가기: {post.videoUrl}
              </Button>
            </div>
          </div>
        )}

        {post.content && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f9f9f9', borderRadius: 8 }}>
            <Text strong>영상 메모 및 설명</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {post.content}
            </Paragraph>
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 12 }}>
          <span>작성자: {post.author}</span>
          <span>등록일: {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</span>
        </div>
      </div>
    </Modal>
  );
};
