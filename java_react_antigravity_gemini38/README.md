# YouTube 영상 공유게시판 앱 (WatchLater) 개발자 가이드

YouTube 동영상 링크와 학습 메모를 공유하고 관리할 수 있는 풀스택 웹 애플리케이션입니다.  
오라클 18c XE 개발 서버와 연동되며, **Spring Boot 3.4** 백엔드와 **React 19 + TypeScript + Ant Design + AG Grid** 프론트엔드로 구현되었습니다.

---

## 1. 기술 스택 (Tech Stack)

### 1.1 Frontend
- **Framework / Runtime**: React 19, TypeScript, Vite
- **UI Libraries**: Ant Design (v5.24), AG Grid Community (v33.1), Lucide React
- **State Management**: Zustand
- **Server State & Data Fetching**: TanStack Query (React Query v5)
- **HTTP Client**: Axios (JWT 인터셉터 탑재)
- **Styling**: Vanilla CSS (유튜브 레드 네온 악센트 + 다크 글래스모피즘 디자인 시스템)

### 1.2 Backend
- **Language / Runtime**: Java 17
- **Framework**: Spring Boot 3.4.3
- **Security & Auth**: Spring Security 6, JWT (io.jsonwebtoken JJWT 0.12.6, BCrypt 암호화)
- **Web**: Spring Web MVC (RESTful API)
- **ORM / Persistence**: Spring Data JPA, Hibernate
- **Package 명**: `kr.co.tkinfo.watchlater`
- **API Documentation**: Springdoc OpenAPI UI 2.8.5 (Swagger 3)
- **Encoding**: UTF-8

### 1.3 Database
- **DBMS**: Oracle Database 18c Express Edition Release 18.0.0.0.0
- **JDBC Driver**: Oracle JDBC Driver (`ojdbc11:23.7.0.25.01`)

---

## 2. DB 접속 및 스키마 정보

### 2.1 DB 접속 설정
| 항목 | 값 |
| :--- | :--- |
| **Host** | `192.168.45.2` |
| **Port** | `1521` |
| **Service Name** | `XEPDB1` |
| **User** | `USERSTK9` |
| **Password** | `PwUserStk9` |
| **JDBC URL** | `jdbc:oracle:thin:@192.168.45.2:1521/XEPDB1` |

### 2.2 테이블 및 시퀀스 명세

#### TB_USER (사용자 마스터 테이블)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `USER_ID` | NUMBER | PK (SEQ_TB_USER) | 사용자 고유식별자 |
| `LOGIN_ID` | VARCHAR2(50 CHAR) | UNIQUE, NOT NULL | 로그인 계정 아이디 |
| `USER_NM` | VARCHAR2(50 CHAR) | NOT NULL | 사용자 이름 / 닉네임 |
| `USER_PW` | VARCHAR2(256 CHAR) | NOT NULL | BCrypt 해시 비밀번호 |
| `EMAIL` | VARCHAR2(100 CHAR) | NULL 허용 | 이메일 주소 |
| `USE_YN` | CHAR(1 CHAR) | NOT NULL, DEFAULT 'Y' | 계정 활성 여부 ('Y'/'N') |
| `REG_DT` | DATE | NOT NULL, DEFAULT SYSDATE | 계정 등록일시 |
| `UPT_DT` | DATE | NOT NULL, DEFAULT SYSDATE | 계정 수정일시 |

#### TB_WATCHLATER (나중에 볼 영상 게시판 테이블)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `POST_ID` | NUMBER | PK (SEQ_TB_WATCHLATER) | 게시글 고유식별자 |
| `TITLE` | VARCHAR2(200 CHAR) | NOT NULL | 영상 제목 / 메모 타이틀 |
| `VIDEO_URL` | VARCHAR2(500 CHAR) | NOT NULL | 유튜브 동영상 링크 URL |
| `CONTENT` | CLOB | NOT NULL | 메모 본문 (타임스탬프, 요약 등) |
| `VIEW_CNT` | NUMBER | NOT NULL, DEFAULT 0 | 조회수 |
| `REG_USER_ID` | NUMBER | FK -> TB_USER | 작성자 식별키 |
| `WATCH_YN` | CHAR(1 CHAR) | NOT NULL, DEFAULT 'N' | 시청 완료 여부 ('N': 신규, 'Y': 완료) |
| `DEL_YN` | CHAR(1 CHAR) | NOT NULL, DEFAULT 'N' | 논리 삭제 플래그 ('N': 활성, 'Y': 삭제) |
| `REG_DT` | DATE | NOT NULL, DEFAULT SYSDATE | 등록일시 |
| `UPT_DT` | DATE | NOT NULL, DEFAULT SYSDATE | 수정일시 |

---

## 3. 기본 계정 및 인증 정보

| 아이디 | 비밀번호 | 권한 | 설명 |
| :--- | :--- | :--- | :--- |
| **`stk1`** | **`stk1`** | ROLE_USER | 기본 테스트 계정 (로그인 창 기본값 등록됨) |

- 로그인 시 JWT Access Token이 발급되며, 클라이언트의 상태 저장소(Zustand + LocalStorage)에 보관됩니다.
- JWT 인증 헤더: `Authorization: Bearer <accessToken>`

---

## 4. 디렉토리 구조

```text
antigravity_gemini38flash/
├── backend/                               # Spring Boot 백엔드 애플리케이션
│   ├── .mvn/                              # Maven Wrapper 설정
│   ├── mvnw, mvnw.cmd                     # Maven 실행 래퍼 스크립트
│   ├── pom.xml                            # 백엔드 의존성 및 빌드 설정
│   └── src/main/
│       ├── java/kr/co/tkinfo/watchlater/
│       │   ├── WatchLaterApplication.java # Spring Boot 진입점
│       │   ├── config/                    # Security, JWT, Swagger, 예외 처리
│       │   │   ├── SecurityConfig.java
│       │   │   ├── JwtTokenProvider.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   ├── OpenApiConfig.java
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── controller/                # REST API 컨트롤러
│       │   │   ├── AuthController.java
│       │   │   └── WatchLaterController.java
│       │   ├── domain/                    # JPA Entity (TB_USER, TB_WATCHLATER)
│       │   │   ├── User.java
│       │   │   └── WatchLater.java
│       │   ├── dto/                       # Request / Response DTO
│       │   │   ├── LoginRequest.java
│       │   │   ├── LoginResponse.java
│       │   │   ├── UserDto.java
│       │   │   ├── WatchLaterCreateRequest.java
│       │   │   ├── WatchLaterUpdateRequest.java
│       │   │   └── WatchLaterResponse.java
│       │   ├── repository/                # Spring Data JPA 리포지토리
│       │   │   ├── UserRepository.java
│       │   │   └── WatchLaterRepository.java
│       │   └── service/                   # 비즈니스 로직
│       │       ├── AuthService.java
│       │       └── WatchLaterService.java
│       └── resources/
│           └── application.yml            # 포트, Oracle 연결, JPA, JWT 설정
├── frontend/                              # React 19 + TypeScript 프론트엔드
│   ├── package.json                       # 패키지 명세
│   ├── vite.config.ts                     # Vite 설정 및 /api 프록시
│   ├── tsconfig.json                      # TS 설정
│   ├── index.html                         # 진입 HTML (Outfit, Pretendard 폰트)
│   └── src/
│       ├── api/                           # Axios 인스턴스 및 API 호출 모듈
│       │   └── client.ts
│       ├── store/                         # Zustand 인증 상태 저장소
│       │   └── useAuthStore.ts
│       ├── components/                    # 재사용 UI 컴포넌트
│       │   ├── Navbar.tsx                 # 상단 헤더, 프로필, 로그인 버튼
│       │   ├── LoginModal.tsx             # 기본 계정(stk1/stk1) 로그인 모달
│       │   ├── PostCard.tsx               # 유튜브 썸네일 & 카드 컴포넌트
│       │   ├── PostTable.tsx              # AG Grid 33 테이블 컴포넌트
│       │   ├── PostDetailModal.tsx        # 유튜브 인라인 재생 및 상세 모달
│       │   └── PostFormModal.tsx          # 등록 및 수정 모달 (실시간 썸네일 감지)
│       ├── types.ts                       # 프론트엔드 데이터 모델 타입
│       ├── index.css                      # 다크 글래스모피즘 디자인 시스템 CSS
│       ├── App.tsx                        # 메인 보드 대시보드
│       └── main.tsx                       # React 19 렌더링 루트
└── README.md                              # 개발자 가이드 (본 문서)
```

---

## 5. REST API 명세 (RESTful APIs)

Swagger UI를 통해 웹 브라우저에서 인터랙티브하게 API를 확인하고 직접 테스트할 수 있습니다.
- **Swagger UI 접속 주소**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON 문서**: `http://localhost:8080/v3/api-docs`

### 5.1 인증 API (`/api/auth`)
| Method | Endpoint | 설명 | 인증 필요 |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | 로그인 (기본값: stk1 / stk1) 및 JWT 발급 | 불필요 |
| `GET` | `/api/auth/me` | 현재 로그인된 사용자 정보 조회 | 필요 |

### 5.2 영상 공유 게시판 API (`/api/watchlater`)
| Method | Endpoint | 설명 | 인증 필요 |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/watchlater` | **첫페이지 전체 목록 조회** (페이징 미사용, 최신순) | 불필요 |
| `GET` | `/api/watchlater/{id}` | **단건 상세 조회** (조회수 +1 자동 증가) | 불필요 |
| `POST` | `/api/watchlater` | **게시물 신규 등록** (제목, URL, 내용, 신규/완료) | 필요 |
| `PUT` | `/api/watchlater/{id}` | **게시물 내용 수정** (제목, URL, 내용, 신규/완료) | 필요 |
| `PATCH`| `/api/watchlater/{id}/toggle-status`| **시청 상태 빠른 토글** ('N' ↔ 'Y') | 필요 |
| `DELETE`| `/api/watchlater/{id}` | **게시물 삭제** (논리 삭제: DEL_YN='Y') | 필요 |

---

## 6. 구현된 핵심 기능 상세

1. **첫페이지 전체 목록 표시 (페이징 미사용)**
   - 초기 화면 진입 시 DB 내 삭제되지 않은 모든 영상 목록을 즉시 렌더링합니다.
   - TanStack Query를 활용하여 백그라운드 캐싱 및 실시간 갱신을 지원합니다.
2. **로그인 기능 (기본값 자동 등록)**
   - 상단 '로그인' 버튼 클릭 시 나타나는 모달 창에 `stk1` / `stk1`이 기본값으로 사전 입력되어 있습니다.
   - 원클릭 로그인 및 '기본값 채우기' 보조 버튼을 지원합니다.
3. **카드 뷰 & AG Grid 테이블 뷰 토글**
   - **카드 뷰 (Card View)**: 유튜브 고화질 썸네일, 마우스 호버 시 재생 버튼 애니메이션, 상태 뱃지가 강조되는 모던 갤러리 형태
   - **AG Grid 뷰 (Table View)**: 엔터프라이즈급 AG Grid를 활용하여 썸네일, 제목, 상태, 작성자, 조회수, 등록일을 한눈에 정렬 및 확인 가능
4. **목록에서 영상 바로가기 기능**
   - 카드와 테이블에 배치된 `ExternalLink` 아이콘을 누르면 새 창/새 탭에서 해당 유튜브 영상 원본 페이지로 즉시 이동합니다.
   - 카드를 클릭하면 앱 내부 모달 플레이어에서 고화질 임베드(`iframe`) 스트리밍 재생이 가능합니다.
5. **게시물 등록 (제목, 영상URL, 내용, 신규/완료 구분)**
   - 제목, 유튜브 영상 URL, 내용(메모), 시청 상태(신규: 'N', 완료: 'Y')를 등록할 수 있습니다.
   - URL 입력 시 정규표현식을 통해 `youtu.be`, `watch?v=`, `shorts` 등 다양한 형태의 유튜브 링크에서 비디오 ID를 실시간 추출하여 썸네일 미리보기를 제공합니다.
6. **게시물 수정 기능**
   - 기존 등록된 제목, URL, 내용, 상태를 수정 모달을 통해 변경할 수 있습니다.
7. **게시물 삭제 기능**
   - Popconfirm 확인 팝업을 거쳐 삭제 요청 시 오라클 DB에서 `DEL_YN = 'Y'`로 안전하게 논리 삭제(Soft Delete)됩니다.
8. **실시간 검색 및 필터링**
   - 전체 / 신규 미시청 / 시청 완료 상태 필터 버튼
   - 영상 제목, 메모 내용, 작성자 이름 실시간 통합 검색 입력창
   - 헤더 배너에 전체/신규/완료 카운트 통계 카드 실시간 집계

---

## 7. 실행 및 검증 가이드

### 7.1 백엔드 서버 기동
```powershell
cd c:\Users\jinso\source\watch_later\antigravity_gemini38flash\backend
.\mvnw.cmd spring-boot:run
```
- 서버 포트: `http://localhost:8080`
- Swagger 문서: `http://localhost:8080/swagger-ui.html`

### 7.2 프론트엔드 개발 서버 기동
```powershell
cd c:\Users\jinso\source\watch_later\antigravity_gemini38flash\frontend
npm run dev
```
- 프론트엔드 포트: `http://localhost:5173`
- Vite 개발 서버는 `/api` 요청을 자동으로 백엔드(`http://localhost:8080`)로 프록시하여 CORS 문제 없이 원활하게 통신합니다.

### 7.3 빌드 검증
- **백엔드 빌드**: `mvnw.cmd clean package -DskipTests`
- **프론트엔드 빌드**: `npm run build`
