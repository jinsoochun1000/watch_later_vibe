import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import type { WatchLaterItem } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { Tag, Button, Tooltip, Popconfirm } from 'antd';
import { Play, ExternalLink, Edit3, Trash2, CheckCircle, Clock } from 'lucide-react';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface PostTableProps {
  items: WatchLaterItem[];
  onSelect: (item: WatchLaterItem) => void;
  onEdit: (item: WatchLaterItem) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const PostTable: React.FC<PostTableProps> = ({
  items,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { user } = useAuthStore();
  const isAuthorOrLoggedIn = !!user;

  const columnDefs = useMemo<any[]>(() => {
    return [
      {
        field: 'postId',
        headerName: 'No.',
        width: 75,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      },
      {
        headerName: '썸네일',
        width: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const item = params.data as WatchLaterItem;
          const thumb = item?.youtubeVideoId
            ? `https://img.youtube.com/vi/${item.youtubeVideoId}/mqdefault.jpg`
            : '';
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                cursor: 'pointer',
              }}
              onClick={() => onSelect(item)}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt=""
                  style={{
                    width: 80,
                    height: 45,
                    borderRadius: 6,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 45,
                    borderRadius: 6,
                    background: '#1e2130',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: 11,
                  }}
                >
                  No Image
                </div>
              )}
            </div>
          );
        },
      },
      {
        field: 'title',
        headerName: '영상 제목 및 내용',
        flex: 2,
        minWidth: 240,
        cellRenderer: (params: any) => {
          const item = params.data as WatchLaterItem;
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                cursor: 'pointer',
              }}
              onClick={() => onSelect(item)}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: '#f8fafc',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: 2,
                }}
              >
                {item.content || '내용 없음'}
              </div>
            </div>
          );
        },
      },
      {
        field: 'watchYn',
        headerName: '상태',
        width: 100,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        cellRenderer: (params: any) => {
          const isDone = params.value === 'Y';
          return (
            <Tag
              color={isDone ? 'success' : 'processing'}
              style={{
                cursor: isAuthorOrLoggedIn ? 'pointer' : 'default',
                fontWeight: 600,
                borderRadius: 12,
                padding: '2px 10px',
              }}
              onClick={() => isAuthorOrLoggedIn && onToggleStatus(params.data.postId)}
            >
              {isDone ? '완료' : '신규'}
            </Tag>
          );
        },
      },
      {
        field: 'authorName',
        headerName: '작성자',
        width: 110,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'viewCnt',
        headerName: '조회수',
        width: 90,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      },
      {
        field: 'regDt',
        headerName: '등록일시',
        width: 120,
        cellStyle: { display: 'flex', alignItems: 'center' },
        valueFormatter: (params: any) => {
          return params.value ? params.value.substring(0, 10) : '';
        },
      },
      {
        headerName: '작업',
        width: 170,
        sortable: false,
        filter: false,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
        cellRenderer: (params: any) => {
          const item = params.data as WatchLaterItem;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* 재생 모달 열기 */}
              <Tooltip title="영상 재생">
                <Button
                  size="small"
                  type="text"
                  icon={<Play size={15} color="#ff0033" />}
                  onClick={() => onSelect(item)}
                />
              </Tooltip>

              {/* 유튜브 바로가기 */}
              <Tooltip title="새 창으로 원본 바로가기">
                <Button
                  size="small"
                  type="text"
                  icon={<ExternalLink size={15} color="#00e5ff" />}
                  href={item.videoUrl}
                  target="_blank"
                />
              </Tooltip>

              {/* 수정 */}
              {isAuthorOrLoggedIn && (
                <Tooltip title="수정">
                  <Button
                    size="small"
                    type="text"
                    icon={<Edit3 size={15} color="#94a3b8" />}
                    onClick={() => onEdit(item)}
                  />
                </Tooltip>
              )}

              {/* 삭제 */}
              {isAuthorOrLoggedIn && (
                <Popconfirm
                  title="게시물 삭제"
                  description="정말 삭제하시겠습니까?"
                  okText="삭제"
                  cancelText="취소"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => onDelete(item.postId)}
                >
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<Trash2 size={15} />}
                  />
                </Popconfirm>
              )}
            </div>
          );
        },
      },
    ];
  }, [isAuthorOrLoggedIn, onSelect, onEdit, onDelete, onToggleStatus]);

  return (
    <div
      className="ag-theme-alpine"
      style={{
        height: 580,
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      <AgGridReact
        rowData={items}
        columnDefs={columnDefs}
        rowHeight={65}
        headerHeight={46}
        animateRows={true}
        pagination={false}
      />
    </div>
  );
};
