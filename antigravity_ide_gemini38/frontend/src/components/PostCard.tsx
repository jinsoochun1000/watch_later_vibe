import React from 'react';
import type { WatchLaterItem } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Play, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Edit3, 
  Trash2, 
  Eye, 
  User 
} from 'lucide-react';
import { Tooltip, Popconfirm } from 'antd';

interface PostCardProps {
  item: WatchLaterItem;
  onSelect: (item: WatchLaterItem) => void;
  onEdit: (item: WatchLaterItem) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  item,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { user } = useAuthStore();
  const isAuthorOrLoggedIn = !!user;

  // YouTube Thumbnail URL
  const thumbnailUrl = item.youtubeVideoId
    ? `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';

  const isCompleted = item.watchYn === 'Y';

  const formattedDate = item.regDt ? item.regDt.substring(0, 10) : '';

  return (
    <div className="post-card" id={`post-card-${item.postId}`}>
      {/* Thumbnail + Overlays */}
      <div className="thumbnail-container" onClick={() => onSelect(item)}>
        <img
          src={thumbnailUrl}
          alt={item.title}
          className="thumbnail-img"
          loading="lazy"
          onError={(e) => {
            // fallback
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
          }}
        />
        <div className="play-overlay">
          <div className="play-button-circle">
            <Play size={26} fill="white" style={{ marginLeft: 3 }} />
          </div>
        </div>

        {/* Status Badge */}
        <div className={`status-badge ${isCompleted ? 'completed' : 'new'}`}>
          {isCompleted ? '완료' : '신규'}
        </div>
      </div>

      {/* Body */}
      <div className="post-card-body">
        <h3 
          className="post-card-title" 
          title={item.title}
          onClick={() => onSelect(item)}
        >
          {item.title}
        </h3>

        <p className="post-card-content">
          {item.content || '별도 메모 내용이 없습니다.'}
        </p>

        {/* Footer */}
        <div className="post-card-footer">
          <div className="post-author-info">
            <div className="author-avatar">
              {(item.authorName || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.authorName}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                <Eye size={12} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                {item.viewCnt}회 · {formattedDate}
              </span>
            </div>
          </div>

          <div className="post-actions-group">
            {/* 영상 바로가기 기능 */}
            <Tooltip title="유튜브 원본 영상 새 창으로 바로가기">
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-icon-btn"
                onClick={(e) => e.stopPropagation()}
                id={`btn-open-youtube-${item.postId}`}
              >
                <ExternalLink size={16} />
              </a>
            </Tooltip>

            {/* 상태 토글 (신규 / 완료) */}
            {isAuthorOrLoggedIn && (
              <Tooltip title={isCompleted ? '신규(미시청) 상태로 변경' : '완료(시청완료) 상태로 변경'}>
                <button
                  type="button"
                  className="action-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(item.postId);
                  }}
                  style={{
                    color: isCompleted ? '#10b981' : '#00e5ff',
                  }}
                  id={`btn-toggle-status-${item.postId}`}
                >
                  {isCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}
                </button>
              </Tooltip>
            )}

            {/* 수정 */}
            {isAuthorOrLoggedIn && (
              <Tooltip title="게시물 내용 수정">
                <button
                  type="button"
                  className="action-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                  id={`btn-edit-post-${item.postId}`}
                >
                  <Edit3 size={15} />
                </button>
              </Tooltip>
            )}

            {/* 삭제 */}
            {isAuthorOrLoggedIn && (
              <Popconfirm
                title="게시물 삭제"
                description="이 영상을 보관 목록에서 삭제하시겠습니까?"
                okText="삭제"
                cancelText="취소"
                okButtonProps={{ danger: true }}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onDelete(item.postId);
                }}
              >
                <button
                  type="button"
                  className="action-icon-btn delete"
                  onClick={(e) => e.stopPropagation()}
                  id={`btn-delete-post-${item.postId}`}
                >
                  <Trash2 size={15} />
                </button>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
