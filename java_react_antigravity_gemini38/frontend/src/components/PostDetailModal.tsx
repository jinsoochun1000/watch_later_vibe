import React from 'react';
import type { WatchLaterItem } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { Modal, Button, Tag, Space, Divider, Popconfirm } from 'antd';
import { ExternalLink, Edit3, Trash2, Eye, User, Calendar, CheckCircle, Clock } from 'lucide-react';

interface PostDetailModalProps {
  item: WatchLaterItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: WatchLaterItem) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { user } = useAuthStore();
  const isAuthorOrLoggedIn = !!user;

  if (!item) return null;

  const isCompleted = item.watchYn === 'Y';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={840}
      centered
      destroyOnClose
      styles={{
        body: { padding: '8px 12px 20px 12px' }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* YouTube Video Player Embed */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#000',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          }}
        >
          {item.youtubeVideoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${item.youtubeVideoId}?autoplay=1&rel=0`}
              title={item.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
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
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: '#94a3b8',
              }}
            >
              <div>직접 재생할 수 없는 외부 동영상 링크입니다.</div>
              <Button
                type="primary"
                href={item.videoUrl}
                target="_blank"
                icon={<ExternalLink size={16} />}
              >
                원본 영상 새 창으로 열기
              </Button>
            </div>
          )}
        </div>

        {/* Header Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Tag
              color={isCompleted ? 'success' : 'processing'}
              style={{
                fontSize: '0.85rem',
                padding: '3px 12px',
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              {isCompleted ? '시청 완료' : '신규 (미시청)'}
            </Tag>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
              <Eye size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              조회수 {item.viewCnt}회
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.4, margin: '8px 0' }}>
            {item.title}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#94a3b8',
              fontSize: '0.88rem',
              marginTop: 10,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={15} color="#a855f7" />
                <strong style={{ color: '#e2e8f0' }}>{item.authorName}</strong> ({item.authorLoginId})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} color="#64748b" />
                {item.regDt ? item.regDt.replace('T', ' ').substring(0, 16) : ''}
              </span>
            </div>

            {/* 원본 영상 바로가기 버튼 */}
            <Button
              type="default"
              href={item.videoUrl}
              target="_blank"
              icon={<ExternalLink size={15} />}
              style={{
                borderRadius: 8,
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#38bdf8',
              }}
            >
              YouTube 원본 바로가기
            </Button>
          </div>
        </div>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

        {/* Content Section */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            padding: 18,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#cbd5e1',
            lineHeight: 1.7,
            fontSize: '0.96rem',
            whiteSpace: 'pre-wrap',
            maxHeight: 250,
            overflowY: 'auto',
          }}
        >
          {item.content || '작성된 내용이 없습니다.'}
        </div>

        {/* Actions Bar */}
        {isAuthorOrLoggedIn && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <Button
              icon={isCompleted ? <Clock size={16} /> : <CheckCircle size={16} />}
              onClick={() => onToggleStatus(item.postId)}
              style={{
                borderRadius: 8,
                borderColor: isCompleted ? '#38bdf8' : '#10b981',
                color: isCompleted ? '#38bdf8' : '#10b981',
              }}
            >
              {isCompleted ? '신규(미시청)로 변경' : '완료(시청완료)로 변경'}
            </Button>

            <Button
              icon={<Edit3 size={15} />}
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              style={{ borderRadius: 8 }}
            >
              수정
            </Button>

            <Popconfirm
              title="게시물 삭제"
              description="이 게시물을 정말 삭제하시겠습니까?"
              okText="삭제"
              cancelText="취소"
              okButtonProps={{ danger: true }}
              onConfirm={() => {
                onClose();
                onDelete(item.postId);
              }}
            >
              <Button danger icon={<Trash2 size={15} />} style={{ borderRadius: 8 }}>
                삭제
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </Modal>
  );
};
