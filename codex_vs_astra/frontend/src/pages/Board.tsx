import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { Alert, App, Button, Drawer, Empty, Input, Modal, Segmented, Skeleton, Tag } from 'antd';
import { ArrowUpOutlined, CheckCircleOutlined, ExportOutlined, LogoutOutlined, PlayCircleFilled, PlusOutlined, ReloadOutlined, SearchOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { errorMessage, logout, postsApi } from '../api';
import { useAuth } from '../auth';
import { PostEditor } from '../components/PostEditor';
import type { Post, PostInput } from '../types';
import { videoId } from '../youtube';

const gridTheme = themeQuartz.withParams({ accentColor: '#4f63ed', backgroundColor: '#ffffff', borderColor: '#edf0f5', fontFamily: '"Segoe UI", "Malgun Gothic", sans-serif', fontSize: 13, headerBackgroundColor: '#f8f9fc', headerTextColor: '#798299', rowHoverColor: '#f7f8ff', wrapperBorderRadius: 12 });
const date = (value: string) => new Date(value + 'Z').toLocaleDateString('ko-KR');
function StatusTag({ status }: { status: Post['status'] }) { return <Tag color={status === 'NEW' ? 'blue' : 'green'} bordered={false}>{status === 'NEW' ? '신규' : '완료'}</Tag>; }

export function Board() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username, ready } = useAuth();
  const query = useQuery({ queryKey: ['posts'], queryFn: postsApi.list });
  const posts = query.data ?? [];
  const [filter, setFilter] = useState('전체');
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [selected, setSelected] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const save = useMutation({ mutationFn: (input: PostInput) => editing ? postsApi.update(editing.id, input) : postsApi.create(input),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['posts'] }); setEditor(false); setSelected(null); void message.success(editing ? '게시물을 수정했습니다.' : '새로운 영상을 공유했습니다.'); },
    onError: (e) => { void message.error(errorMessage(e)); },
  });
  const remove = useMutation({ mutationFn: postsApi.delete,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['posts'] }); setDeleting(null); setSelected(null); void message.success('게시물을 삭제했습니다.'); },
    onError: (e) => { void message.error(errorMessage(e)); },
  });
  const filtered = useMemo(() => posts.filter((post) =>
    (filter === '전체' || post.status === (filter === '신규' ? 'NEW' : 'DONE')) &&
    `${post.title} ${post.content ?? ''} ${post.author}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [posts, filter, search]);
  const columns = useMemo<ColDef<Post>[]>(() => [
    { headerName: '영상', field: 'title', flex: 1, minWidth: 300, cellRenderer: ({ data }: ICellRendererParams<Post>) => data && <button className="video-cell" onClick={() => setSelected(data)}>
      <span className="thumbnail">{videoId(data.videoUrl) ? <img src={`https://i.ytimg.com/vi/${videoId(data.videoUrl)}/mqdefault.jpg`} alt="" loading="lazy" /> : <PlayCircleFilled />}</span>
      <span className="video-copy"><strong>{data.title}</strong><span>{data.content || '내용이 없는 게시물입니다.'}</span></span>
    </button> },
    { headerName: '상태', field: 'status', width: 100, cellRenderer: ({ data }: ICellRendererParams<Post>) => data && <StatusTag status={data.status} /> },
    { headerName: '등록자', field: 'author', width: 110 },
    { headerName: '등록일', field: 'createdAt', width: 140, valueFormatter: ({ value }) => date(value as string) },
    { headerName: '바로가기', width: 110, sortable: false, cellRenderer: ({ data }: ICellRendererParams<Post>) => data && <a className="watch-link" href={data.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${data.title} YouTube에서 보기`}>영상 보기 <ExportOutlined /></a> },
  ], []);
  const newCount = posts.filter((p) => p.status === 'NEW').length;
  return <div className="app-shell"><header className="header"><div className="header-inner">
    <Link to="/" className="brand"><PlayCircleFilled /> WATCH LATER</Link><span className="nav-current">영상 게시판</span>
    <div className="account">{username ? <><span className="avatar">{username.slice(0, 1).toUpperCase()}</span><span>{username}</span><Button type="text" icon={<LogoutOutlined />} loading={loggingOut} onClick={async () => {
      setLoggingOut(true); try { await logout(); setEditor(false); setSelected(null); } catch (e) { void message.error(errorMessage(e)); } finally { setLoggingOut(false); }
    }}>로그아웃</Button></> : <Button onClick={() => navigate('/login')} disabled={!ready}>로그인</Button>}</div>
  </div></header>
    <main className="board"><section className="hero"><div><span className="eyebrow">OUR SHARED PLAYLIST</span><h1>오늘의 발견,<br className="mobile-break" /> 함께 보는 즐거움.</h1><p>좋은 영상을 모아두고, 우리만의 이야기를 나눠보세요.</p><Button type="primary" size="large" icon={<PlusOutlined />} disabled={!ready} onClick={() => {
      if (!username) { navigate('/login'); return; } setEditing(null); setEditor(true);
    }}>영상 공유하기</Button></div><div className="hero-art" aria-hidden="true"><div className="art-card back"></div><div className="art-card front"><span className="art-dot"></span><PlayCircleFilled /><span className="art-line"></span><span className="art-line short"></span></div><span className="art-check"><CheckCircleOutlined /></span><span className="art-caption">Your next inspiration ↗</span></div></section>
    <section className="stats" aria-label="게시판 현황"><div><span className="stat-icon purple"><VideoCameraOutlined /></span><span>전체 영상<strong>{query.isSuccess ? posts.length : '—'}<small>개</small></strong></span></div><div><span className="stat-icon blue"><PlayCircleFilled /></span><span>시청할 영상<strong>{query.isSuccess ? newCount : '—'}<small>개</small></strong></span></div><div><span className="stat-icon green"><CheckCircleOutlined /></span><span>시청 완료<strong>{query.isSuccess ? posts.length - newCount : '—'}<small>개</small></strong></span></div></section>
    <section className="library"><div className="section-heading"><div><h2>우리의 영상 모음 <span>{posts.length}</span></h2><p>작은 발견이 모여 더 넓은 시야가 됩니다.</p></div><Button type="text" icon={<ReloadOutlined spin={query.isFetching} />} onClick={() => { void query.refetch(); }}>새로고침</Button></div>
      <div className="toolbar"><Segmented options={['전체', '신규', '완료']} value={filter} onChange={setFilter} /><Input className="search-input" prefix={<SearchOutlined />} placeholder="제목, 내용, 등록자 검색" aria-label="영상 검색" value={search} onChange={(e) => setSearch(e.target.value)} allowClear /></div>
      {query.isError && <Alert type="error" showIcon title="영상 목록을 불러오지 못했습니다." description={errorMessage(query.error)} action={<Button onClick={() => { void query.refetch(); }}>다시 시도</Button>} />}
      {query.isPending ? <div className="loading"><Skeleton active paragraph={{ rows: 5 }} /></div> : !query.isError && <>
        {filtered.length ? <div className="grid-wrap"><AgGridReact<Post> theme={gridTheme} rowData={filtered} columnDefs={columns} getRowId={({ data }) => String(data.id)} rowHeight={90} headerHeight={44} domLayout="autoHeight" pagination={false} defaultColDef={{ sortable: true, resizable: true }} localeText={{ noRowsToShow: '등록된 영상이 없습니다.', ariaLabelColumnMenu: '열 메뉴', sortAscending: '오름차순', sortDescending: '내림차순', sortUnSort: '정렬 해제' }} /></div> : <div className="empty"><Empty description={posts.length ? '검색 조건에 맞는 영상이 없습니다.' : '아직 등록된 영상이 없어요. 첫 영상을 공유해 보세요.'} /></div>}
        <div className="list-footer"><span>총 {filtered.length}개의 영상 · 전체 목록 표시</span><span>마음에 드는 영상은 바로 열어보세요 <ArrowUpOutlined rotate={45} /></span></div>
      </>}
    </section><footer className="footer"><span>WATCH LATER</span><span>함께 모으고, 함께 성장하는 공간.</span></footer>
    </main>
    <PostEditor open={editor} post={editing} busy={save.isPending} onClose={() => setEditor(false)} onSave={(input) => save.mutate(input)} />
    <Drawer title="영상 상세" open={!!selected} onClose={() => setSelected(null)} size={560}>
      {selected && <div className="detail"><StatusTag status={selected.status} /><h2>{selected.title}</h2><p className="muted">{selected.author} · {date(selected.createdAt)} 등록</p>
        <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer"><img className="detail-image" src={`https://i.ytimg.com/vi/${videoId(selected.videoUrl)}/hqdefault.jpg`} alt={`${selected.title} 미리보기`} /></a>
        <Button type="primary" href={selected.videoUrl} target="_blank" rel="noopener noreferrer" icon={<ExportOutlined />}>YouTube에서 영상 보기</Button>
        <h3>내용</h3><p className="detail-content">{selected.content || '등록된 내용이 없습니다.'}</p>
        {username && <div className="detail-actions"><Button onClick={() => { setEditing(selected); setEditor(true); }}>수정</Button><Button danger onClick={() => setDeleting(selected)}>삭제</Button></div>}
      </div>}
    </Drawer>
    <Modal title="게시물을 삭제할까요?" open={!!deleting} okText="삭제" cancelText="취소" okButtonProps={{ danger: true }} confirmLoading={remove.isPending} cancelButtonProps={{ disabled: remove.isPending }} closable={!remove.isPending} maskClosable={!remove.isPending} onCancel={() => setDeleting(null)} onOk={() => deleting && remove.mutate(deleting.id)}><p>“{deleting?.title}” 게시물을 삭제합니다. 삭제한 게시물은 복구할 수 없습니다.</p></Modal>
  </div>;
}
