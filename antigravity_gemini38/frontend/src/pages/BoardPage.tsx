import React, { useState } from 'react';
import {
  Row,
  Col,
  Input,
  Radio,
  Segmented,
  Button,
  Statistic,
  Card,
  Spin,
  Empty,
  message,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  TableOutlined,
  VideoCameraAddOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { PostCard } from '../components/PostCard';
import { PostTable } from '../components/PostTable';
import { PostModal } from '../components/PostModal';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { postApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Post, PostCreatePayload, PostStatus, PostUpdatePayload } from '../types';

const { Search } = Input;
const { Title, Text } = Typography;

export const BoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [keyword, setKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Video Player Modal State
  const [playingPost, setPlayingPost] = useState<Post | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Queries
  const {
    data: posts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['posts', keyword, statusFilter],
    queryFn: () =>
      postApi.getAllPosts(
        keyword || undefined,
        statusFilter === 'ALL' ? undefined : (statusFilter as PostStatus)
      ),
  });

  const { data: stats } = useQuery({
    queryKey: ['postStatistics'],
    queryFn: () => postApi.getStatistics(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: PostCreatePayload) => postApi.createPost(payload),
    onSuccess: () => {
      message.success('게시물이 성공적으로 등록되었습니다.');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postStatistics'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || '게시물 등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PostUpdatePayload }) =>
      postApi.updatePost(id, payload),
    onSuccess: () => {
      message.success('게시물이 성공적으로 수정되었습니다.');
      setIsModalOpen(false);
      setSelectedPost(null);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postStatistics'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || '게시물 수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postApi.deletePost(id),
    onSuccess: () => {
      message.success('게시물이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postStatistics'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || '게시물 삭제에 실패했습니다.');
    },
  });

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedPost(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: Post) => {
    setSelectedPost(post);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handlePlayVideo = (post: Post) => {
    setPlayingPost(post);
    setIsPlayerOpen(true);
  };

  const handleDeletePost = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleModalSubmit = async (values: PostCreatePayload | PostUpdatePayload) => {
    if (modalMode === 'create') {
      await createMutation.mutateAsync(values as PostCreatePayload);
    } else if (modalMode === 'edit' && selectedPost) {
      await updateMutation.mutateAsync({
        id: selectedPost.id,
        payload: values as PostUpdatePayload,
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenCreateModal={handleOpenCreateModal} />

      <main style={{ flex: 1, padding: '24px 32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="전체 영상"
                value={stats?.totalCount ?? posts.length}
                prefix={<PlayCircleOutlined style={{ color: '#1677ff' }} />}
                suffix="개"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="신규 영상 (시청 대기)"
                value={stats?.newCount ?? 0}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
                suffix="개"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="시청 완료"
                value={stats?.completedCount ?? 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
                suffix="개"
              />
            </Card>
          </Col>
        </Row>

        {/* Filter and Control Bar */}
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={14}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <Radio.Group
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="ALL">전체 보기</Radio.Button>
                  <Radio.Button value="NEW">신규</Radio.Button>
                  <Radio.Button value="COMPLETED">완료</Radio.Button>
                </Radio.Group>

                <Search
                  placeholder="제목, 내용, 작성자 검색..."
                  allowClear
                  onSearch={(val) => setKeyword(val)}
                  style={{ width: 260 }}
                  prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                />
              </div>
            </Col>

            <Col xs={24} md={10} style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Segmented
                value={viewMode}
                onChange={(val) => setViewMode(val as 'card' | 'grid')}
                options={[
                  { label: '카드형', value: 'card', icon: <AppstoreOutlined /> },
                  { label: '그리드(AG-Grid)', value: 'grid', icon: <TableOutlined /> },
                ]}
              />

              {isAuthenticated && (
                <Button
                  type="primary"
                  danger
                  icon={<VideoCameraAddOutlined />}
                  onClick={handleOpenCreateModal}
                >
                  게시물 등록
                </Button>
              )}
            </Col>
          </Row>
        </Card>

        {/* Post List Section */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" tip="영상 목록을 불러오는 중..." />
          </div>
        ) : isError ? (
          <Card style={{ textAlign: 'center', padding: '40px 0', borderRadius: 12 }}>
            <Text type="danger">데이터를 불러오는 중 오류가 발생했습니다.</Text>
            <div style={{ marginTop: 12 }}>
              <Button onClick={() => refetch()}>다시 시도</Button>
            </div>
          </Card>
        ) : posts.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 0', borderRadius: 12 }}>
            <Empty description="등록된 영상 게시물이 없습니다.">
              {isAuthenticated && (
                <Button type="primary" danger onClick={handleOpenCreateModal}>
                  첫 번째 영상 등록하기
                </Button>
              )}
            </Empty>
          </Card>
        ) : viewMode === 'card' ? (
          <Row gutter={[20, 20]}>
            {posts.map((post) => (
              <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
                <PostCard
                  post={post}
                  onPlay={handlePlayVideo}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeletePost}
                  isLoggedIn={isAuthenticated}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <PostTable
            posts={posts}
            onPlay={handlePlayVideo}
            onEdit={handleOpenEditModal}
            onDelete={handleDeletePost}
            isLoggedIn={isAuthenticated}
          />
        )}
      </main>

      {/* Modals */}
      <PostModal
        open={isModalOpen}
        mode={modalMode}
        initialData={selectedPost}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPost(null);
        }}
        onSubmit={handleModalSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <VideoPlayerModal
        open={isPlayerOpen}
        post={playingPost}
        onClose={() => {
          setIsPlayerOpen(false);
          setPlayingPost(null);
        }}
      />
    </div>
  );
};
