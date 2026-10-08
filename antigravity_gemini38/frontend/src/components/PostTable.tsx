import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community';
import { Button, Tag, Space, Popconfirm, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Post } from '../types';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface PostTableProps {
  posts: Post[];
  onPlay: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  isLoggedIn: boolean;
}

export const PostTable: React.FC<PostTableProps> = ({
  posts,
  onPlay,
  onEdit,
  onDelete,
  isLoggedIn,
}) => {
  const columnDefs = useMemo<ColDef<Post>[]>(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'thumbnailUrl',
      headerName: '썸네일',
      width: 120,
      cellRenderer: (params: any) => {
        const post = params.data as Post;
        return post.thumbnailUrl ? (
          <div
            style={{ display: 'flex', alignItems: 'center', height: '100%', cursor: 'pointer' }}
            onClick={() => onPlay(post)}
          >
            <img
              src={post.thumbnailUrl}
              alt=""
              style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }}
            />
          </div>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      field: 'title',
      headerName: '영상 제목',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const post = params.data as Post;
        return (
          <div
            style={{ fontWeight: 600, color: '#1677ff', cursor: 'pointer' }}
            onClick={() => onPlay(post)}
          >
            {post.title}
          </div>
        );
      },
    },
    {
      field: 'status',
      headerName: '구분',
      width: 110,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const post = params.data as Post;
        return post.status === 'COMPLETED' ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            완료
          </Tag>
        ) : (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            신규
          </Tag>
        );
      },
    },
    {
      field: 'author',
      headerName: '작성자',
      width: 110,
      sortable: true,
    },
    {
      field: 'createdAt',
      headerName: '등록일',
      width: 120,
      sortable: true,
      valueFormatter: (params: any) =>
        params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    {
      headerName: '영상 바로가기',
      width: 150,
      cellRenderer: (params: any) => {
        const post = params.data as Post;
        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => onPlay(post)}
            >
              재생
            </Button>
            <Tooltip title="새 탭에서 열기">
              <Button
                size="small"
                icon={<ExportOutlined />}
                href={post.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      headerName: '관리',
      width: 110,
      hide: !isLoggedIn,
      cellRenderer: (params: any) => {
        const post = params.data as Post;
        return (
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
                description="이 게시물을 삭제하시겠습니까?"
                onConfirm={() => onDelete(post.id)}
                okText="삭제"
                cancelText="취소"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ], [isLoggedIn, onPlay, onEdit, onDelete]);

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <AgGridReact
        rowData={posts}
        columnDefs={columnDefs}
        rowHeight={55}
        pagination={false}
        animateRows={true}
      />
    </div>
  );
};
