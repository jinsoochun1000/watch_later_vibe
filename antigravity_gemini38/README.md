# WatchLater - YouTube 영상 공유 게시판 앱 (개발자 가이드)

YouTube 영상을 간편하게 등록하고 시청 대기(신규) 및 시청 완료 상태를 관리할 수 있는 모던 풀스택 영상 공유 게시판 애플리케이션입니다.

---

## 1. 프로젝트 개요

- **프로젝트명**: WatchLater (YouTube 영상 공유 게시판)
- **백엔드 패키지**: `kr.co.tkinfo.watchlater`
- **인코딩**: UTF-8
- **기본 접속 계정**: `stk1` / `stk1`
- **주요 특징**:
  - 첫 페이지 진입 시 페이징 없이 모든 영상 목록 즉시 로드
  - YouTube URL 자동 파싱 (비디오 ID 추출, 고화질 썸네일 자동 연동, 인라인 모달 플레이어 및 새 탭 바로가기)
  - 게시물 상태 구분: **신규 (시청 대기)** / **완료 (시청 완료)**
  - 모던 UI 뷰 전환: **Ant Design 카드 뷰** ↔ **AG Grid 데이터 그리드 뷰**
  - Querydsl 동적 쿼리 검색 (제목, 내용, 작성자) 및 필터링
  - MyBatis 기반 게시물 통계 대시보드
  - Spring Security + JWT Stateless 인증 (Access Token in Memory, Refresh Token in HttpOnly Cookie + Redis/Cache)
  - Flyway 데이터베이스 형상 관리 및 Oracle 18c XE 연동
  - Springdoc OpenAPI (Swagger UI) 지원

---

## 2. 기술 스택 (Tech Stack)

### 2.1 Frontend
- **Core**: React 19 (`19.0.0`), TypeScript (`~5.7.2`), Vite (`^6.2.0`)
- **Server State**: TanStack Query (React Query v5)
- **Client State**: Zustand v5
- **Routing**: React Router v7 (`react-router-dom`)
- **HTTP Client**: Axios (인터셉터를 통한 JWT 토큰 자동 주입 및 Refresh Token 기반 자동 갱신)
- **UI Components & Grid**:
  - Ant Design (antd v5, `@ant-design/icons`)
  - AG Grid Community & React (`^33.1.1`)

### 2.2 Backend
- **Language & Runtime**: Java 17
- **Framework**: Spring Boot 3.4.3
- **Security**: Spring Security 6.x, JJWT (io.jsonwebtoken `0.12.6`)
- **ORM & SQL Mapping**:
  - Spring Data JPA & Hibernate 6.x
  - Querydsl 5.1.0 (Jakarta)
  - MyBatis 3.0.4 (`mybatis-spring-boot-starter`)
- **Database Migration**: Flyway (`flyway-core`, `flyway-database-oracle`)
- **Cache & Token Store**: Spring Data Redis (Standalone / Graceful In-Memory Fallback 지원)
- **API Documentation**: Springdoc-OpenAPI UI (`2.8.5`)
- **Build Tool**: Gradle 8.11.1

### 2.3 Database
- **DBMS**: Oracle Database 18c XE
- **호스트**: `192.168.45.2:1521/XEPDB1`
- **계정**: `USERSTK9`

---

## 3. 데이터베이스 구성 (Oracle 18c XE)

공유 개발 서버 환경에서의 객체 충돌 방지를 위해 `WLA_` (WatchLater Antigravity) 네임스페이스를 적용하였습니다.

### 3.1 테이블 및 시퀀스

| 객체명 | 유형 | 설명 |
|---|---|---|
| `WLA_USERS` | TABLE | 사용자 계정 테이블 (아이디, BCrypt 암호, 권한, 생성/수정일) |
| `WLA_POSTS` | TABLE | YouTube 영상 게시물 테이블 (제목, 영상 URL, 내용 CLOB, 상태, 작성자, 생성/수정일) |
| `WLA_FLYWAY_HISTORY` | TABLE | Flyway 전용 스키마 마이그레이션 이력 테이블 |
| `WLA_USER_SEQ` | SEQUENCE | 사용자 PK 시퀀스 |
| `WLA_POST_SEQ` | SEQUENCE | 게시물 PK 시퀀스 |

### 3.2 Flyway 마이그레이션 (`V1__init_schema.sql`)
- 위치: `backend/src/main/resources/db/migration/V1__init_schema.sql`
- 시퀀스 및 테이블 생성 DDL 실행
- 기본 계정 `stk1` (`ROLE_USER`) 등록
- 샘플 YouTube 영상 3건 등록

---

## 4. 백엔드 아키텍처 및 주요 패키지 구조

```
backend/src/main/java/kr/co/tkinfo/watchlater/
├── WatchLaterApplication.java          # Spring Boot 메인 클래스
├── config/
│   ├── DataInitializer.java           # stk1 / stk1 기본 사용자 검증 및 등록
│   ├── GlobalExceptionHandler.java    # 전역 REST 예외 핸들러
│   ├── JwtAuthenticationFilter.java   # JWT Bearer 토큰 검증 필터
│   ├── JwtTokenProvider.java          # JWT Access/Refresh 토큰 생성 및 검증
│   ├── QuerydslConfig.java            # JPAQueryFactory Bean 등록
│   ├── SecurityConfig.java            # Spring Security 및 CORS/Stateless 설정
│   └── SwaggerConfig.java             # OpenAPI 3.0 Swagger UI 설정
├── controller/
│   ├── AuthController.java            # 로그인, 토큰 갱신, 로그아웃, 사용자 정보 조회 API
│   └── PostController.java            # 영상 게시물 CRUD 및 통계 API
├── domain/
│   ├── BaseTimeEntity.java            # 생성일/수정일 자동 관리 Auditing 엔티티
│   ├── Post.java                      # 영상 게시물 JPA 엔티티
│   ├── PostStatus.java                # 상태 Enum (NEW: 신규, COMPLETED: 완료)
│   └── User.java                      # 사용자 JPA 엔티티
├── dto/
│   ├── ApiResponse.java               # 통일된 JSON 공통 응답 DTO
│   ├── LoginRequest.java / LoginResponse.java
│   └── PostCreateRequest.java / PostUpdateRequest.java / PostResponse.java
├── mapper/
│   └── PostMapper.java                # MyBatis 통계 조회 매퍼 인터페이스 (resources/mapper/PostMapper.xml 연동)
├── repository/
│   ├── PostQueryRepository.java       # Querydsl 기반 동적 검색 및 필터링 리포지토리
│   ├── PostRepository.java            # Spring Data JPA 리포지토리
│   └── UserRepository.java            # Spring Data JPA 사용자 리포지토리
└── service/
    ├── AuthService.java               # 로그인, 쿠키 설정, 토큰 갱신 비즈니스 로직
    ├── PostService.java               # 게시물 CRUD 및 통계 비즈니스 로직
    └── RefreshTokenService.java       # Redis 연동 및 연결 불가 시 메모리 Fallback 토큰 저장소
```

---

## 5. 프론트엔드 구성 및 주요 컴포넌트

```
frontend/src/
├── main.tsx                           # ReactDOM 마운트 & AG Grid 스타일 import
├── App.tsx                            # React Router, Ant Design ConfigProvider (koKR), 세션 복원
├── types/
│   └── index.ts                       # Post, User, ApiResponse, Status 타입 정의
├── services/
│   └── api.ts                         # Axios 인스턴스, Request/Response 인터셉터, API 호출 모듈
├── store/
│   └── authStore.ts                   # Zustand 기반 인증 상태 스토어 (Access Token in Memory)
├── components/
│   ├── Navbar.tsx                     # 헤더, 사용자 메뉴, 로그아웃, 영상 등록 버튼
│   ├── PostCard.tsx                   # Ant Design 카드 뷰 (썸네일, 배지, 재생/바로가기/수정/삭제)
│   ├── PostTable.tsx                  # AG Grid 테이블 뷰 (정렬, 필터, 컬럼 렌더러)
│   ├── PostModal.tsx                  # 게시글 등록/수정 모달 (실시간 YouTube URL 미리보기)
│   └── VideoPlayerModal.tsx           # YouTube iframe 모달 인라인 재생 플레이어
└── pages/
    ├── BoardPage.tsx                  # 메인 게시판 (페이징 없는 전체 목록, 검색, 탭 필터, 카드/그리드 토글)
    └── LoginPage.tsx                  # 로그인 화면 (stk1 / stk1 자동 채움 및 원클릭 로그인 지원)
```

---

## 6. 핵심 기능 구현 내용

### 6.1 첫 페이지 모든 목록 표시 (페이징 없음)
- 요구사항에 따라 페이징 없이 전체 게시물이 첫 페이지에 로드됩니다.
- Querydsl을 통해 최신 등록 순(`id.desc()`)으로 정렬되며, 키워드 검색(`title`, `content`, `author`) 및 상태(`NEW`, `COMPLETED`) 필터링을 실시간으로 지원합니다.

### 6.2 YouTube 영상 바로가기 및 인라인 재생
- 영상 URL 입력 시 YouTube 정규식 패턴 분석을 통해 11자리 고유 비디오 ID를 추출합니다.
- 추출된 비디오 ID로 YouTube HQ 썸네일(`https://img.youtube.com/vi/{id}/hqdefault.jpg`)을 자동 렌더링합니다.
- **바로가기**: 새 탭에서 원본 YouTube 영상 페이지 오픈.
- **재생**: 애플리케이션 내부에서 모달 팝업으로 즉시 시청할 수 있는 iframe 플레이어 제공.

### 6.3 게시물 상태 구분 (신규 / 완료)
- `PostStatus.NEW` (신규 - 시청 대기, 파란색 태그)
- `PostStatus.COMPLETED` (완료 - 시청 완료, 초록색 태그)
- 상단 탭에서 "전체 보기", "신규", "완료"로 필터링 가능.
- 수정 모달에서 언제든 신규 ↔ 완료 상태를 변경할 수 있습니다.

### 6.4 모던 UI 듀얼 뷰 (카드 뷰 & AG Grid)
- **카드 뷰**: 직관적인 YouTube 썸네일 중심의 비주얼 카드 그리드.
- **AG Grid 뷰**: rules.md 요구사항에 따른 엔터프라이즈 AG Grid 테이블. 컬럼 정렬, 텍스트 필터링, 셀 렌더러 지원.

### 6.5 인증 및 보안 (JWT + Refresh Token)
- **Access Token**: 브라우저 메모리(Zustand)에만 보관하여 XSS 공격 방어.
- **Refresh Token**: `HttpOnly`, `SameSite=Lax` 쿠키로 전송되며 Redis (또는 메모리 캐시)에 보관.
- Axios 인터셉터를 통해 401 Unauthorized 발생 시 자동으로 `/api/auth/refresh`를 호출하여 Access Token을 무중단 재발급.

---

## 7. REST API 명세 요약

Swagger UI 주소: `http://localhost:8080/swagger-ui.html`

### 7.1 인증 API (`/api/auth`)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|---|---|---|---|
| `POST` | `/api/auth/login` | 로그인 및 JWT 토큰 발급 (아이디/비밀번호) | ✕ |
| `POST` | `/api/auth/refresh` | Refresh Token 기반 새 Access Token 재발급 | ✕ (쿠키 필요) |
| `POST` | `/api/auth/logout` | 로그아웃 및 토큰 만료 | ○ |
| `GET` | `/api/auth/me` | 현재 로그인 사용자 정보 조회 | ○ |

### 7.2 게시물 API (`/api/posts`)
| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|---|---|---|---|
| `GET` | `/api/posts` | 페이징 없는 전체 게시물 목록 조회 (검색/상태 파라미터 지원) | ✕ (누구나 조회 가능) |
| `GET` | `/api/posts/{id}` | 게시물 상세 조회 | ✕ |
| `POST` | `/api/posts` | 신규 게시물 등록 (제목, 영상URL, 내용, 상태) | ○ |
| `PUT` | `/api/posts/{id}` | 게시물 수정 (제목, 영상URL, 내용, 상태) | ○ |
| `DELETE` | `/api/posts/{id}` | 게시물 삭제 | ○ |
| `GET` | `/api/posts/statistics` | MyBatis 기반 게시물 통계 (전체/신규/완료 건수) | ✕ |

---

## 8. 실행 및 개발 가이드

### 8.1 사전 요구사항
- Java 17 이상
- Node.js 18 이상 및 npm
- Oracle 18c XE 서버 네트워크 접근 가능 (`192.168.45.2:1521`)

### 8.2 백엔드 실행 방법
```bash
cd backend

# Gradle Wrapper 빌드 및 실행
./gradlew bootRun
```
- 서버 기동 주소: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### 8.3 프론트엔드 실행 방법
```bash
cd frontend

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```
- 브라우저 접속: `http://localhost:5173`
- Vite 개발 서버 프록시가 설정되어 있어 프론트엔드에서 `/api` 호출 시 자동으로 `http://localhost:8080`으로 포워딩됩니다.

### 8.4 기본 계정 로그인 안내
- **아이디**: `stk1`
- **비밀번호**: `stk1`
- 로그인 화면에서 "기본값 입력" 버튼을 누르거나 직접 입력하여 바로 로그인할 수 있습니다.
- 로그인 없이도 메인 화면에서 모든 영상 목록 열람, 영상 재생, 바로가기 기능이 동작합니다.
- 게시물 등록/수정/삭제 시에는 로그인이 필요합니다.
