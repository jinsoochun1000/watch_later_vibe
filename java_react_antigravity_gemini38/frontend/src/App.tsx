import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api/client';
import type { WatchLaterItem } from './types';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { PostTable } from './components/PostTable';
import { PostDetailModal } from './components/PostDetailModal';
import { PostFormModal } from './components/PostFormModal';
import { LoginModal } from './components/LoginModal';
import { 
  ConfigProvider, 
  theme, 
  message, 
  Spin, 
  Empty, 
  Button, 
  Radio 
} from 'antd';
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Sparkles, 
  PlaySquare, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  LogIn 
} from 'lucide-react';

export const App: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Filters & Views
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('CARD');

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchLaterItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<WatchLaterItem | null>(null);

  // Fetch all posts (no pagination)
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['watchlater-posts'],
    queryFn: api.getPosts,
  });

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => api.toggleStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['watchlater-posts'] });
      message.success(
        updated.watchYn === 'Y' ? '시청 완료로 변경되었습니다.' : '신규(미시청)로 변경되었습니다.'
      );
      if (selectedItem && selectedItem.postId === updated.postId) {
        setSelectedItem(updated);
      }
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || '상태 변경 중 오류가 발생했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlater-posts'] });
      message.success('게시물이 삭제되었습니다.');
      if (selectedItem) setSelectedItem(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    },
  });

  // Filtered & Searched posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Status filter
      if (filter === 'NEW' && post.watchYn !== 'N') return false;
      if (filter === 'COMPLETED' && post.watchYn !== 'Y') return false;

      // Search keyword
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(q);
        const contentMatch = (post.content || '').toLowerCase().includes(q);
        const authorMatch = (post.authorName || '').toLowerCase().includes(q);
        return titleMatch || contentMatch || authorMatch;
      }

      return true;
    });
  }, [posts, filter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = posts.length;
    const newCount = posts.filter((p) => p.watchYn === 'N').length;
    const completedCount = posts.filter((p) => p.watchYn === 'Y').length;
    return { total, newCount, completedCount };
  }, [posts]);

  // Handlers
  const handleOpenCreate = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    setEditingItem(null);
    setFormModalOpen(true);
  };

  const handleEdit = (item: WatchLaterItem) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    setEditingItem(item);
    setFormModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const handleSelectPost = async (item: WatchLaterItem) => {
    setSelectedItem(item);
    // increment view count via API single fetch
    try {
      const detailed = await api.getPost(item.postId);
      setSelectedItem(detailed);
      queryClient.invalidateQueries({ queryKey: ['watchlater-posts'] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#ff0033',
          colorBgContainer: '#151722',
          borderRadius: 8,
          fontFamily: "'Outfit', 'Pretendard', sans-serif",
        },
      }}
    >
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenCreate={handleOpenCreate}
        />

        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff4d6d', fontWeight: 700, marginBottom: 8 }}>
              <Sparkles size={18} />
              <span>YouTube Video Memory Board</span>
            </div>
            <h1>나중에 볼 YouTube 영상 공유 보드</h1>
            <p>
              학습할 테크 영상, 즐겨찾는 강의를 간편하게 저장하고 언제든 즉시 감상하세요.
              오라클 18c XE와 최신 스프링 부트 3 & 리액트 19로 구동됩니다.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-box">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">전체 영상</div>
            </div>
            <div className="stat-box">
              <div className="stat-number" style={{ color: '#00e5ff' }}>
                {stats.newCount}
              </div>
              <div className="stat-label">신규 미시청</div>
            </div>
            <div className="stat-box">
              <div className="stat-number" style={{ color: '#10b981' }}>
                {stats.completedCount}
              </div>
              <div className="stat-label">시청 완료</div>
            </div>
          </div>
        </section>

        {/* Controls & Filter Bar */}
        <section className="controls-bar">
          {/* Status Filter Buttons */}
          <div className="filter-group">
            <button
              id="filter-all"
              type="button"
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              <PlaySquare size={16} />
              전체 ({stats.total})
            </button>
            <button
              id="filter-new"
              type="button"
              className={`filter-btn ${filter === 'NEW' ? 'active' : ''}`}
              onClick={() => setFilter('NEW')}
            >
              <Clock size={16} />
              신규 미시청 ({stats.newCount})
            </button>
            <button
              id="filter-completed"
              type="button"
              className={`filter-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setFilter('COMPLETED')}
            >
              <CheckCircle2 size={16} />
              시청 완료 ({stats.completedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              id="input-search"
              type="text"
              className="search-input"
              placeholder="영상 제목, 메모 내용, 작성자 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* View Mode & Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="CARD" id="view-mode-card">
                <LayoutGrid size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                카드 뷰
              </Radio.Button>
              <Radio.Button value="TABLE" id="view-mode-table">
                <TableIcon size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                AG Grid 뷰
              </Radio.Button>
            </Radio.Group>

            <Button
              id="btn-controls-create"
              type="primary"
              icon={<PlusCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
              onClick={handleOpenCreate}
              style={{
                height: 38,
                borderRadius: 8,
              }}
            >
              영상 등록
            </Button>
          </div>
        </section>

        {/* Content Area */}
        <main>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" tip="영상 목록을 불러오는 중..." />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#ff4d6d' }}>
              <h3>데이터 로딩 중 오류가 발생했습니다.</h3>
              <p>백엔드 서버와 오라클 DB 연결 상태를 확인해주세요.</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <Empty
                description={
                  <span style={{ color: '#94a3b8', fontSize: '1rem' }}>
                    {search ? `'${search}'에 해당하는 영상이 없습니다.` : '등록된 영상이 없습니다.'}
                  </span>
                }
              >
                {user ? (
                  <Button type="primary" onClick={handleOpenCreate} icon={<PlusCircle size={16} />}>
                    첫 번째 영상 등록하기
                  </Button>
                ) : (
                  <Button type="primary" onClick={() => setLoginModalOpen(true)} icon={<LogIn size={16} />}>
                    로그인하고 영상 등록하기
                  </Button>
                )}
              </Empty>
            </div>
          ) : viewMode === 'CARD' ? (
            <div className="cards-grid">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  item={post}
                  onSelect={handleSelectPost}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : (
            <PostTable
              items={filteredPosts}
              onSelect={handleSelectPost}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </main>

        {/* Modals */}
        <LoginModal
          open={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />

        <PostDetailModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        <PostFormModal
          open={formModalOpen}
          item={editingItem}
          onClose={() => setFormModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['watchlater-posts'] });
          }}
        />
      </div>
    </ConfigProvider>
  );
};
export default App;
