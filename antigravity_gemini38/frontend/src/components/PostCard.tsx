import React from 'react';
import { Card, Tag, Typography, Button, Space, Popconfirm, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Post } from '../types';

const { Title, Paragraph, Text } = Typography;

interface PostCardProps {
  post: Post;
  onPlay: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  isLoggedIn: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPlay,
  onEdit,
  onDelete,
  isLoggedIn,
}) => {
  const isCompleted = post.status === 'COMPLETED';

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}
      bodyStyle={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
      }}
      cover={
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            backgroundColor: '#000',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onClick={() => onPlay(post)}
        >
          {post.thumbnailUrl ? (
            <img
              alt={post.title}
              src={post.thumbnailUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 24,
              }}
            >
              <PlayCircleOutlined />
            </div>
          )}

          {/* Overlay Play Button */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.65)',
              borderRadius: '50%',
              width: 54,
              height: 54,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 28,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <PlayCircleOutlined />
          </div>

          {/* Status Badge */}
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            {isCompleted ? (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontWeight: 600, padding: '2px 8px' }}>
                완료
              </Tag>
            ) : (
              <Tag color="processing" icon={<ClockCircleOutlined />} style={{ fontWeight: 600, padding: '2px 8px' }}>
                신규
              </Tag>
            )}
          </div>
        </div>
      }
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Title
          level={5}
          style={{
            margin: '0 0 8px 0',
            fontSize: 15,
            lineHeight: 1.4,
            cursor: 'pointer',
          }}
          onClick={() => onPlay(post)}
          ellipsis={{ rows: 2, tooltip: post.title }}
        >
          {post.title}
        </Title>

        <Paragraph
          type="secondary"
          ellipsis={{ rows: 2, tooltip: post.content }}
          style={{ fontSize: 13, minHeight: 38, marginBottom: 12, flex: 1 }}
        >
          {post.content || '(등록된 메모 내용이 없습니다)'}
        </Paragraph>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            작성자: {post.author}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
          </Text>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => onPlay(post)}
            >
              재생
            </Button>
            <Tooltip title="새 탭에서 YouTube 바로가기">
              <Button
                size="small"
                icon={<ExportOutlined />}
                href={post.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                바로가기
              </Button>
            </Tooltip>
          </Space>

          {isLoggedIn && (
            <Space size="small">
              <Tooltip title="수정">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(post)}
                />
              </Tooltip>
              <Tooltip title="삭제">
                <Popconfirm
                  title="게시물 삭제"
                  description="정말로 이 게시물을 삭제하시겠습니까?"
                  onConfirm={() => onDelete(post.id)}
                  okText="삭제"
                  cancelText="취소"
                  okButtonProps={{ danger: true }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Tooltip>
            </Space>
          )}
        </div>
      </div>
    </Card>
  );
};
