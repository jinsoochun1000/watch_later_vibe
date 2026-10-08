import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useSearchParams, Link } from 'react-router';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, App as AntApp, Button, ConfigProvider, Empty, Form, Input, Modal, Radio, Segmented, Skeleton, Tooltip } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { PlayCircleFilled, PlusOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined, ArrowUpOutlined, ArrowRightOutlined, CheckOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, LogoutOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { api, errorMessage, login, logout, refresh, useAuth, type Post, type PostInput } from './api';
import './styles.css';

ModuleRegistry.registerModules([AllCommunityModule]);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 10000 } } });
const date = (value: string) => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
const statusLabel = (status: string) => status === 'DONE' ? '완료' : '신규';

function Board() {
  const { message, modal } = AntApp.useApp();
  const query = useQueryClient();
  const { session, ready } = useAuth();
  const [params, setParams] = useSearchParams();
  const filter = params.get('status') || 'ALL';
  const [search, setSearch] = useState('');
  const [view, setView] = useState('cards');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [editor, setEditor] = useState<Post | 'new' | null>(null);
  const [detail, setDetail] = useState<Post | null>(null);
  const [editorError, setEditorError] = useState('');
  const [form] = Form.useForm<PostInput>();
  const [loginForm] = Form.useForm();
  useEffect(() => { void refresh(); }, []);
  const posts = useQuery({ queryKey: ['posts'], queryFn: async () => (await api.get<Post[]>('/posts')).data });
  const stats = useQuery({ queryKey: ['stats'], queryFn: async () => (await api.get<{ total: number; newCount: number; doneCount: number }>('/posts/stats')).data });
  const invalidate = () => { void query.invalidateQueries({ queryKey: ['posts'] }); void query.invalidateQueries({ queryKey: ['stats'] }); };
  const save = useMutation({
    mutationFn: async (input: PostInput) => {
      if (typeof editor === 'object' && editor) await api.put(`/posts/${editor.id}`, { ...input, version: editor.version });
      else await api.post('/posts', input);
    },
    onSuccess: () => { invalidate(); setEditor(null); message.success('게시물을 저장했습니다.'); },
    onError: (error) => { setEditorError(errorMessage(error)); invalidate(); },
  });
  const changeStatus = useMutation({
    mutationFn: (p: Post) => api.put(`/posts/${p.id}`, { title: p.title, videoUrl: p.videoUrl, content: p.content, status: p.status === 'NEW' ? 'DONE' : 'NEW', version: p.version }),
    onSuccess: () => { invalidate(); message.success('상태를 변경했습니다.'); }, onError: (error) => { message.error(errorMessage(error)); invalidate(); },
  });
  const remove = (post: Post) => modal.confirm({
    title: '게시물을 삭제할까요?', content: `“${post.title}” 게시물은 삭제 후 복구할 수 없습니다.`, okText: '삭제', cancelText: '취소', okButtonProps: { danger: true },
    onOk: async () => { try { await api.delete(`/posts/${post.id}`, { params: { version: post.version } }); invalidate(); setDetail(null); message.success('게시물을 삭제했습니다.'); } catch (error) { message.error(errorMessage(error)); invalidate(); throw error; } },
  });
  const openEditor = (post: Post | 'new') => {
    if (!session) { setLoginOpen(true); return; }
    setEditorError(''); setEditor(post);
    form.setFieldsValue(post === 'new' ? { title: '', videoUrl: '', content: '', status: 'NEW' } : post);
  };
  const filtered = useMemo(() => (posts.data || []).filter((p) => (filter === 'ALL' || p.status === filter) && `${p.title} ${p.content}`.toLowerCase().includes(search.toLowerCase())), [posts.data, filter, search]);
  const total = stats.data?.total ?? posts.data?.length ?? 0;
  const newCount = stats.data?.newCount ?? posts.data?.filter((p) => p.status === 'NEW').length ?? 0;
  const doneCount = stats.data?.doneCount ?? posts.data?.filter((p) => p.status === 'DONE').length ?? 0;
  const actions = (p: Post) => <div className="post-actions">
    <Tooltip title="게시물 수정"><Button type="text" aria-label={`${p.title} 수정`} icon={<EditOutlined />} onClick={() => openEditor(p)} /></Tooltip>
    <Tooltip title="게시물 삭제"><Button type="text" aria-label={`${p.title} 삭제`} icon={<DeleteOutlined />} onClick={() => remove(p)} /></Tooltip>
  </div>;
  const columns: ColDef<Post>[] = [
    { headerName: '상태', field: 'status', width: 100, cellRenderer: ({ value }: ICellRendererParams) => <span className={`badge ${value === 'DONE' ? 'done' : ''}`}>{statusLabel(value)}</span> },
    { headerName: '제목', field: 'title', flex: 2, minWidth: 220, cellRenderer: ({ data }: ICellRendererParams<Post>) => data && <button className="table-title" onClick={() => setDetail(data)}>{data.title}</button> },
    { headerName: '등록자', field: 'author', width: 110 },
    { headerName: '등록일', field: 'createdAt', width: 140, valueFormatter: ({ value }) => date(value) },
    { headerName: '영상', width: 100, sortable: false, cellRenderer: ({ data }: ICellRendererParams<Post>) => data && <a href={data.videoUrl} target="_blank" rel="noopener noreferrer">바로가기 ↗</a> },
    ...(session ? [{ headerName: '관리', width: 180, sortable: false, cellRenderer: ({ data }: ICellRendererParams<Post>) => data && <div className="grid-actions"><Button size="small" disabled={changeStatus.isPending} onClick={() => changeStatus.mutate(data)}>{data.status === 'NEW' ? '완료로' : '신규로'}</Button>{actions(data)}</div> }] : []),
  ];
  return <div className="shell">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-icon"><PlayCircleFilled /></span>watchlater<span className="brand-dot">.</span></Link>
      <div className="workspace-label">OUR VIDEO LIBRARY</div>
      <nav aria-label="게시물 구분">
        <button className={filter === 'ALL' ? 'nav-item active' : 'nav-item'} onClick={() => setParams({})}><AppstoreOutlined />전체 영상<span>{total}</span></button>
        <button className={filter === 'NEW' ? 'nav-item active' : 'nav-item'} onClick={() => setParams({ status: 'NEW' })}><ClockCircleOutlined />새로 담은 영상<span>{newCount}</span></button>
        <button className={filter === 'DONE' ? 'nav-item active' : 'nav-item'} onClick={() => setParams({ status: 'DONE' })}><CheckOutlined />시청 완료<span>{doneCount}</span></button>
      </nav>
      <div className="sidebar-note"><span className="note-icon"><LinkOutlined /></span><strong>좋은 영상은, 함께.</strong><p>다시 보고 싶은 영상과<br/>함께 나누고 싶은 이야기를<br/>한곳에 모아보세요.</p></div>
      <div className="sidebar-footer"><span className="online-dot"/> 우리의 작은 영상 아카이브<br/><small>WATCHLATER · EST. 2026</small></div>
    </aside>
    <div className="main-wrap">
      <header className="topbar"><div><span className="topbar-label">워크스페이스</span><span className="slash">/</span><span>영상 공유게시판</span></div>
        {session ? <div className="account"><span className="avatar">{session.username[0].toUpperCase()}</span><span>{session.username}</span><Tooltip title="로그아웃"><Button aria-label="로그아웃" type="text" icon={<LogoutOutlined />} onClick={async () => { try { await logout(); message.success('로그아웃했습니다.'); } catch (e) { message.error(errorMessage(e)); } }} /></Tooltip></div> : <Button disabled={!ready} onClick={() => setLoginOpen(true)}>로그인 <ArrowRightOutlined /></Button>}
      </header>
      <main>
        <section className="page-heading"><div><div className="eyebrow"><span/> SAVE. WATCH. SHARE.</div><h1>함께 모으는 영상<span>.</span></h1><p>좋은 콘텐츠를 발견했다면, 이곳에 담아 함께 나눠보세요.</p></div><Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openEditor('new')}>영상 등록</Button></section>
        <section className="stats" aria-label="영상 통계">
          <div className="stat"><div><span>전체 영상</span><strong>{posts.isPending ? '—' : total}<small>개의 이야기</small></strong></div><span className="stat-icon all"><PlayCircleFilled /></span></div>
          <div className="stat"><div><span>새로 담은 영상</span><strong>{posts.isPending ? '—' : newCount}<small>시청을 기다려요</small></strong></div><span className="stat-icon new"><ClockCircleOutlined /></span></div>
          <div className="stat"><div><span>시청 완료</span><strong>{posts.isPending ? '—' : doneCount}<small>차곡차곡 쌓인 영감</small></strong></div><span className="stat-icon complete"><CheckOutlined /></span></div>
        </section>
        <section className="library">
          <div className="library-heading"><h2>영상 라이브러리 <span>{filtered.length}</span></h2><span className="sort-label">최신 등록순 ↓</span></div>
          <div className="toolbar"><div className="filter-tabs">{[['ALL','전체'],['NEW','신규'],['DONE','완료']].map(([value,label]) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setParams(value === 'ALL' ? {} : { status: value })}>{label}</button>)}</div>
            <div className="search-tools"><Input aria-label="영상 검색" placeholder="제목이나 내용으로 검색" prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} allowClear /><Tooltip title="목록 새로고침"><Button aria-label="목록 새로고침" icon={<ReloadOutlined />} onClick={invalidate} loading={posts.isFetching && !posts.isPending} /></Tooltip><Segmented aria-label="보기 방식" value={view} onChange={(value) => setView(value)} options={[{ value: 'cards', icon: <AppstoreOutlined aria-label="카드 보기"/> }, { value: 'table', icon: <UnorderedListOutlined aria-label="표 보기"/> }]} /></div>
          </div>
          {posts.isError ? <Alert title="영상 목록을 불러오지 못했습니다" description={errorMessage(posts.error)} type="error" showIcon action={<Button onClick={() => posts.refetch()}>다시 시도</Button>} /> : posts.isPending ? <div className="card-grid">{[1,2,3].map((n) => <div className="video-card loading" key={n}><Skeleton active /></div>)}</div> : !filtered.length ? <div className="empty"><Empty description={search || filter !== 'ALL' ? '조건에 맞는 영상이 없습니다.' : '아직 담긴 영상이 없어요. 첫 영상을 공유해 보세요.'}/>{!search && filter === 'ALL' && <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor('new')}>첫 영상 등록</Button>}</div> : view === 'table' ? <div className="grid-table"><AgGridReact<Post> theme={themeQuartz.withParams({ fontFamily: 'inherit', accentColor: '#df563d', headerBackgroundColor: '#f7f8fa', borderColor: '#e9ebef', rowHeight: 60 })} rowData={filtered} columnDefs={columns} defaultColDef={{ sortable: true, resizable: true }} getRowId={({ data }) => String(data.id)} pagination={false}/></div> : <div className="card-grid">{filtered.map((p) => <article className="video-card" key={p.id}>
            <a className="thumbnail" href={p.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} YouTube에서 보기`}><img src={`https://i.ytimg.com/vi/${p.videoId}/hqdefault.jpg`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }}/><span className="thumb-fallback"><PlayCircleFilled /></span><span className={`badge ${p.status === 'DONE' ? 'done' : ''}`}>{p.status === 'DONE' ? <CheckOutlined /> : <span className="badge-dot"/>}{statusLabel(p.status)}</span><span className="play-overlay"><PlayCircleFilled /></span><span className="youtube-label">YouTube ↗</span></a>
            <div className="card-body"><button className="card-title" onClick={() => setDetail(p)}>{p.title}</button><p className="card-description">{p.content || '등록된 설명이 없습니다.'}</p><div className="card-meta"><span><span className="mini-avatar">{p.author[0].toUpperCase()}</span>{p.author}</span><time dateTime={p.createdAt}>{date(p.createdAt)}</time></div></div>
            <div className="card-footer">{session ? <button className={`status-button ${p.status === 'DONE' ? 'is-done' : ''}`} disabled={changeStatus.isPending} onClick={() => changeStatus.mutate(p)}><CheckOutlined />{p.status === 'NEW' ? '시청 완료로 표시' : '시청 완료 · 신규로 변경'}</button> : <a href={p.videoUrl} target="_blank" rel="noopener noreferrer">영상 바로가기 <ArrowRightOutlined /></a>}{session ? actions(p) : <span className="footer-caption">함께 보는 즐거움</span>}</div>
          </article>)}</div>}
          {!posts.isPending && !posts.isError && filtered.length > 0 && <div className="list-end"><span/>모든 영상을 확인했어요<span/></div>}
        </section>
        <footer className="page-footer"><span>나중에 볼 영상이, 함께 나눌 이야기가 되는 곳.</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>맨 위로 <ArrowUpOutlined /></button></footer>
      </main>
    </div>
    <Modal title="다시 만나 반가워요" open={loginOpen} onCancel={() => { setLoginOpen(false); setLoginError(''); }} footer={null} width={420}>
      <p className="modal-intro">로그인하고 좋은 영상을 함께 나눠보세요.</p>
      {loginError && <Alert type="error" title={loginError} showIcon className="form-alert"/>}
      <Form form={loginForm} layout="vertical" initialValues={{ username: 'stk1', password: 'stk1' }} onFinish={async (values) => { setLoginBusy(true); setLoginError(''); try { await login(values.username,values.password); setLoginOpen(false); message.success('로그인했습니다.'); } catch (error) { setLoginError(errorMessage(error)); } finally { setLoginBusy(false); } }}>
        <Form.Item name="username" label="로그인 아이디" rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}><Input autoComplete="username" maxLength={50}/></Form.Item>
        <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}><Input.Password autoComplete="current-password" maxLength={100}/></Form.Item>
        <Button htmlType="submit" type="primary" block size="large" loading={loginBusy}>로그인</Button>
      </Form>
    </Modal>
    <Modal title={editor === 'new' ? '새로운 영상 담기' : '게시물 수정'} open={editor !== null} onCancel={() => { if (!save.isPending) setEditor(null); }} footer={null} width={600} maskClosable={!save.isPending}>
      <p className="modal-intro">영상 링크와 함께, 나누고 싶은 이야기를 적어주세요.</p>
      {editorError && <Alert type="error" title={editorError} showIcon className="form-alert"/>}
      <Form form={form} layout="vertical" onFinish={(values) => { setEditorError(''); save.mutate(values); }} disabled={save.isPending}>
        <Form.Item name="title" label="제목" rules={[{ required: true, whitespace: true, message: '제목을 입력해 주세요.' }]}><Input placeholder="어떤 영상인가요?" maxLength={200} showCount/></Form.Item>
        <Form.Item name="videoUrl" label="YouTube 영상 URL" rules={[{ required: true, whitespace: true, message: '영상 URL을 입력해 주세요.' }, { type: 'url', message: 'https://로 시작하는 URL을 입력해 주세요.' }]}><Input prefix={<LinkOutlined />} placeholder="https://www.youtube.com/watch?v=..." maxLength={1000}/></Form.Item>
        <Form.Item name="content" label="내용"><Input.TextArea placeholder="이 영상을 추천하는 이유나 기억하고 싶은 내용을 남겨주세요." rows={5} maxLength={10000} showCount/></Form.Item>
        <Form.Item name="status" label="시청 상태" rules={[{ required: true }]}><Radio.Group optionType="button" options={[{ label: '신규', value: 'NEW' }, { label: '완료', value: 'DONE' }]}/></Form.Item>
        <div className="modal-buttons"><Button onClick={() => setEditor(null)}>취소</Button><Button type="primary" htmlType="submit" loading={save.isPending}>{editor === 'new' ? '영상 등록' : '수정 저장'}</Button></div>
      </Form>
    </Modal>
    <Modal title="영상 이야기" open={detail !== null} onCancel={() => setDetail(null)} footer={detail && <Button type="primary" href={detail.videoUrl} target="_blank" rel="noopener noreferrer" icon={<PlayCircleFilled />}>YouTube에서 보기</Button>}>
      {detail && <div className="detail"><span className={`badge ${detail.status === 'DONE' ? 'done' : ''}`}>{statusLabel(detail.status)}</span><h2>{detail.title}</h2><p>{detail.content || '등록된 설명이 없습니다.'}</p><small>{detail.author} · 등록 {date(detail.createdAt)} · 수정 {date(detail.updatedAt)}</small></div>}
    </Modal>
  </div>;
}
function Root() {
  return <ConfigProvider locale={koKR} theme={{ token: { colorPrimary: '#de593f', colorText: '#252b38', borderRadius: 9, fontFamily: '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif', controlHeight: 40 }, components: { Button: { primaryShadow: 'none' } } }}><AntApp><QueryClientProvider client={queryClient}><BrowserRouter><Routes><Route path="/" element={<Board/>}/><Route path="*" element={<div className="not-found"><h1>페이지를 찾을 수 없습니다.</h1><Link to="/">영상 목록으로 돌아가기</Link></div>}/></Routes></BrowserRouter></QueryClientProvider></AntApp></ConfigProvider>;
}
createRoot(document.getElementById('root')!).render(<Root/>);
