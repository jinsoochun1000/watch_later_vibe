# Watch Later — YouTube 영상 공유게시판 구현 비교

`watch_later_vibe`는 동일한 YouTube 영상 공유게시판 요구사항을 네 개의 독립 프로젝트로 구현한 저장소입니다. 영상 URL과 메모를 등록하고, 신규·완료 상태를 관리하며, 전체 목록에서 영상을 바로 열 수 있습니다.

이 문서는 **2026-10-08 현재 폴더의 소스 코드, 빌드 설정, SQL, 테스트 파일 및 하위 README를 대조**하여 작성했습니다. 폴더명은 현재 디렉터리 기준이며, 폴더명만으로 실제 사용 모델이나 개발 도구의 버전을 확정하지 않습니다. 기술 버전은 프로젝트에 선언된 값이며 최신 버전을 의미하지 않습니다.

## 1. 저장소 구조

```text
watch_later_vibe/
├── README.md                         전체 구성 및 구현 비교
├── .gitignore                        빌드 결과·개인 설정 등의 제외 규칙
├── .github/modernize/java-upgrade/    Java 업그레이드 도구 관련 보조 스크립트
├── .vscode/                          편집기 설정
├── antigravity_gemini38/              Java 17·Gradle·계층별 구성
│   ├── backend/                      Spring Boot, Flyway, MyBatis XML
│   ├── frontend/                     카드·표·영상 재생 모달
│   ├── capture/                      화면 캡처
│   └── README.md, prompt.md, rules.md, gemini.md
├── antigravity_ide_gemini38/          Java 17·Maven·기존 TB_* 스키마 사용
│   ├── backend/                      JPA CRUD, 조회수, 논리 삭제
│   ├── frontend/                     카드·표·로그인/상세 모달
│   ├── capture/                      화면 캡처
│   └── README.md, prompt.md, rules.md, gemini.md
├── codex_astra/                      Java 21·Maven·카드/표 구성
│   ├── backend/                      API, 인증, DB 마이그레이션 및 테스트
│   ├── frontend/                     main.tsx, api.ts, styles.css 중심
│   ├── scripts/                      PowerShell API 스모크 테스트
│   ├── docs/                         검증 화면 이미지
│   ├── capture/                      화면 캡처
│   └── README.md, prompt.md, rules.md, codex.md, compose.yaml
├── codex_vs_astra/                   Java 21·Maven·표 중심 구성
│   ├── backend/                      auth/config/post 패키지 및 테스트
│   ├── frontend/                     pages/components 및 URL 테스트
│   ├── scripts/                      Node.js API 스모크 테스트
│   ├── capture/                      화면 캡처
│   └── README.md, prompt.md, rules.md, codex.md, compose.yaml
└── db_sql/
    └── ddl.sql                       TB_USER·TB_WATCHLATER 초기화 SQL
```

루트에는 통합 애플리케이션이나 공통 빌드 명령이 없습니다. 실행할 프로젝트를 선택하고 그 안의 `backend`와 `frontend`를 각각 실행합니다. `node_modules`, `target`, `build`, `dist`, `bin` 등 의존성·생성 결과는 소스 구조 비교에서 제외합니다.

## 2. 공통 요구사항과 실제 적용 범위

네 폴더의 `prompt.md`와 `rules.md`는 같은 기능과 기술 스택을 제시합니다.

- 첫 화면에서 페이징 없이 전체 게시물 조회
- 기본 개발 계정 `stk1` / `stk1`을 이용한 로그인
- 제목·영상 URL·내용 등록 및 수정
- 신규·완료 상태 구분, 게시물 삭제, 영상 바로가기
- Oracle 연동, 한국어 화면, UTF-8 인코딩
- React, TypeScript, Spring 기반 프런트엔드·백엔드 분리

네 구현 모두 공개 목록과 로그인 후 쓰기 기능을 제공합니다. 수정·삭제 서비스에 작성자 소유권을 검사하는 정책은 없으며, 로그인 사용자가 공유 게시물을 관리하는 구조입니다. 신규·완료는 사용자별 시청 이력이 아닌 **게시물의 공통 상태**입니다.

`rules.md`의 기술 목록과 실제 구현은 구분해야 합니다. 두 Antigravity 폴더는 Spring Boot 3.4.3을 사용하며, `antigravity_ide_gemini38`에는 React Router·Querydsl·MyBatis·Flyway·Redis 및 Refresh Token 구현이 없습니다. 두 Codex 폴더는 Spring Boot 4.0.3과 메모리 Access Token·쿠키/Redis Refresh Token 구조를 적용합니다. Redis가 있는 프로젝트에서도 게시물 캐시와 별도 분산락이 모두 구현된 것은 아닙니다.

## 3. 기술 스택 비교

프런트엔드 버전은 `package.json` 선언 기준입니다. 실제 설치 버전은 각 `package-lock.json`을 확인합니다.

| 항목 | antigravity_gemini38 | antigravity_ide_gemini38 | codex_astra | codex_vs_astra |
|---|---|---|---|---|
| Java | 17 | 17 | 21 | 21 |
| Spring Boot | 3.4.3 | 3.4.3 | 4.0.3 | 4.0.3 |
| 백엔드 빌드 | Gradle 8.11.1 Wrapper | Maven Wrapper | Maven Wrapper | Maven Wrapper |
| React | 19.0 계열 | 19.0 계열 | 19.2 계열 | 19.2 계열 |
| TypeScript | 5.7 계열 | 5.7 계열 | 5.9 계열 | 5.9 계열 |
| Vite | 6.2 계열 | 6.2 계열 | 7.1 계열 | 7.3 계열 |
| Ant Design / AG Grid | 5 / 33 | 5 / 33 | 6 / 35 | 6 / 35 |
| 라우팅 | React Router 7 | 별도 라우터 없음 | React Router 7 | React Router 7 |
| 서버·클라이언트 상태 | TanStack Query / Zustand | 동일 | 동일 | 동일 |
| HTTP 통신 | Axios | Axios | Axios | Axios |
| 데이터 접근 | JPA + Querydsl + MyBatis | JPA | JPA + Querydsl + MyBatis | JPA + Querydsl + MyBatis |
| Querydsl | com.querydsl 5.1, Q 클래스 생성 | 없음 | OpenFeign 배포판 7.1, PathBuilder | com.querydsl 5.1, PathBuilder |
| MyBatis 용도 | 게시물 통계, XML 매퍼 | 없음 | 게시물 통계, 어노테이션 SQL | 로그인 계정 조회·시드 생성 |
| 스키마 관리 | Flyway + JPA update | 기존 스키마, JPA none | Flyway + JPA validate | Flyway + JPA validate |
| OpenAPI UI | springdoc 2.8.5 | springdoc 2.8.5 | springdoc 3.0.1 | springdoc 3.0.3 |

## 4. 화면과 동작 비교

| 항목 | antigravity_gemini38 | antigravity_ide_gemini38 | codex_astra | codex_vs_astra |
|---|---|---|---|---|
| 목록 화면 | 카드 / AG Grid 전환 | 카드 / AG Grid 전환 | 카드 / AG Grid 전환 | AG Grid 표 중심 |
| 로그인 화면 | 별도 페이지 | 모달 | 모달 | 별도 페이지 |
| 영상 열기 | 외부 링크 + 재생 모달 | 외부 링크 + 상세 모달 iframe | 외부 링크 | 외부 링크 |
| 검색·상태 필터 | 서버 Querydsl 검색 | 브라우저 필터 | 브라우저 필터 | 브라우저 필터 |
| 검색 대상 | 제목·내용·작성자 | 제목·내용·작성자 정보 | 제목·내용 | 제목·내용·작성자 |
| 통계 | MyBatis 통계 API | 목록에서 계산 | MyBatis 통계 API | 목록에서 계산 |
| 상태 표현 | NEW / COMPLETED | watchYn: N / Y | NEW / DONE | NEW / DONE |
| 삭제 방식 | 물리 삭제 | DEL_YN=Y 논리 삭제 | 물리 삭제 | 물리 삭제 |
| 조회수 | 별도 기능 없음 | 상세 API 조회 시 증가 | 별도 기능 없음 | 별도 기능 없음 |
| 동시 수정 감지 | 버전 검사 없음 | 버전 검사 없음 | 수정·삭제 요청의 version 검사 | 수정 요청의 version 검사 |

`codex_astra`와 `codex_vs_astra`는 JPA `@Version`을 사용합니다. 다만 후자의 삭제 API는 클라이언트가 읽었던 버전을 받지 않으므로, 오래된 화면에서의 삭제를 전자의 `?version=...` 검사와 동일하게 취급하면 안 됩니다.

YouTube URL 처리도 다릅니다. 두 Codex 구현은 백엔드의 `YoutubeUrl.java`에서 허용 호스트·경로·영상 ID를 검사하고 표준 watch URL로 정규화합니다. Antigravity 구현은 화면의 URL 파싱과 미리보기 중심이므로 같은 검증 계약으로 간주하지 않습니다. 영상 링크를 저장하는 서비스이며, YouTube API를 통한 실제 영상 존재 여부 확인은 하지 않습니다.

## 5. 인증과 세션 관리

| 항목 | antigravity_gemini38 | antigravity_ide_gemini38 | codex_astra | codex_vs_astra |
|---|---|---|---|---|
| Access Token 저장 | Zustand 메모리 | Zustand + LocalStorage | Zustand 메모리 | Zustand 메모리 |
| Access Token 유효기간 | 1시간 | 24시간 | 15분 | 15분 |
| Refresh Token | JWT, 7일 | 없음 | 난수 토큰, 7일 | 난수 토큰, 7일 |
| Refresh 저장소 | Redis, 장애 시 프로세스 메모리 대체 | 없음 | Redis 해시 키 | Redis 해시 키 |
| 쿠키 이름 | refreshToken | 해당 없음 | wl_refresh | wl_refresh |
| 쿠키 범위·정책 | Path=/, HttpOnly, SameSite=Lax | 해당 없음 | Path=/api/auth, HttpOnly, SameSite=Strict | Path=/api/auth, HttpOnly, SameSite=Strict |
| 갱신 처리 | 사용자별 저장 토큰 비교 후 교체 | 재로그인 | Redis GETDEL 원자적 소비 | Redis GETDEL 원자적 소비 |
| 추가 인증 요청 헤더 | 별도 전용 헤더 없음 | 별도 전용 헤더 없음 | X-Requested-With: XMLHttpRequest | X-Watchlater-Client: 1 |
| 로그인 횟수 제한 | 별도 구현 없음 | 별도 구현 없음 | Redis 기반 IP별 분당 20회 | 별도 구현 없음 |

기본 계정 생성 방식에도 차이가 있습니다.

- `antigravity_gemini38`: 시작 시 `DataInitializer`가 계정을 확인합니다. 기존 비밀번호가 `stk1`과 다르면 해당 사용자를 삭제 후 재생성하여 기본 암호를 맞춥니다.
- `antigravity_ide_gemini38`: `stk1` 로그인 요청 시 계정이 없으면 생성합니다. 따라서 먼저 사용자 테이블과 시퀀스가 있어야 합니다.
- `codex_astra`: 시작 시 계정이 없을 때 생성하며 기존 암호를 덮어쓰지 않습니다.
- `codex_vs_astra`: MyBatis 기반 시드로 계정이 없을 때 생성합니다. `SEED_ENABLED`로 생성 여부를 조절합니다.

`antigravity_gemini38`의 메모리 대체 저장소는 프로세스 간 공유되지 않으며 재시작 시 사라집니다. 두 Codex 구현은 Redis가 인증 기능에 필요합니다. LocalStorage 저장 방식과 HttpOnly 쿠키 기반 갱신 방식은 서로 다른 보안·세션 특성을 가지므로 프런트엔드만 교체하여 섞어 사용하지 않습니다.

## 6. 데이터베이스 구성

네 프로젝트는 Oracle 18c XE를 대상으로 하지만 테이블 구조가 서로 다릅니다. 동일 DB 계정을 설정해도 게시물이 자동으로 공유되지 않습니다.

| 폴더 | 사용자 / 게시물 테이블 | 키 생성 | Flyway 이력 |
|---|---|---|---|
| antigravity_gemini38 | WLA_USERS / WLA_POSTS | WLA_USER_SEQ, WLA_POST_SEQ | WLA_FLYWAY_HISTORY |
| antigravity_ide_gemini38 | TB_USER / TB_WATCHLATER | SEQ_TB_USER, SEQ_TB_WATCHLATER | 없음 |
| codex_astra | WL_ASTRA_USERS / WL_ASTRA_POSTS | 사용자명 키, WL_ASTRA_POST_SEQ | WL_ASTRA_SCHEMA_HISTORY |
| codex_vs_astra | WLC_USERS / WLC_POSTS | identity | WLC_FLYWAY_HISTORY |

### 스키마 준비 방식

- `antigravity_gemini38/backend/src/main/resources/db/migration/V1__init_schema.sql`: WLA 객체와 기본 사용자, 샘플 게시물 3건을 정의합니다. 현재 설정은 Flyway와 Hibernate `ddl-auto: update`를 함께 사용합니다.
- `antigravity_ide_gemini38`: 마이그레이션 파일이 없고 `ddl-auto: none`입니다. `db_sql/ddl.sql`에 해당 테이블·시퀀스 정의가 있으므로 기존 객체 유무를 확인하여 준비합니다.
- `codex_astra/backend/src/main/resources/db/migration/V1__watchlater.sql`: 전용 테이블·시퀀스·제약·인덱스를 생성하고 Hibernate가 검증합니다.
- `codex_vs_astra/backend/src/main/resources/db/migration/V1__create_watchlater.sql`: 전용 identity 테이블·상태 제약·인덱스를 생성하고 Hibernate가 검증합니다.

**`db_sql/ddl.sql`은 공통 설치 스크립트가 아닙니다.** 시작 부분에서 `TB_WATCHLATER`, `TB_USER`와 관련 시퀀스를 DROP합니다. 기존 데이터가 있는 스키마에서 전체 실행하면 데이터가 삭제됩니다. 또한 SQL 주석의 계정은 앱 설정과 다르며, 예제 사용자는 `ilcheon`, 비밀번호와 영상 주소는 샘플 값입니다. 이 SQL을 실행했다고 바로 `stk1` 로그인 준비까지 끝나는 것은 아닙니다.

두 Codex 프로젝트는 `OracleLegacyDialect`를 명시하고, 두 Antigravity 프로젝트는 `OracleDialect`를 사용합니다. DB 문자 집합과 애플리케이션 UTF-8 설정은 별개이므로 한글 저장에는 DB의 문자 집합도 확인해야 합니다.

## 7. API 차이

| 기능 | antigravity_gemini38 | antigravity_ide_gemini38 | codex_astra | codex_vs_astra |
|---|---|---|---|---|
| 목록 GET / 등록 POST | /api/posts | /api/watchlater | /api/posts | /api/posts |
| 상세 GET | /api/posts/{id} | /api/watchlater/{id}, 조회수 증가 | 목록 데이터로 표시 | 목록 데이터로 표시 |
| 수정 PUT | /api/posts/{id} | /api/watchlater/{id} | /api/posts/{id}, version 필요 | /api/posts/{id}, version 필요 |
| 삭제 DELETE | /api/posts/{id} | /api/watchlater/{id} | /api/posts/{id}?version=... | /api/posts/{id} |
| 상태 전환 전용 PATCH | 없음 | /api/watchlater/{id}/toggle-status | 없음, 수정 API 사용 | 없음, 수정 API 사용 |
| 통계 GET | /api/posts/statistics | 없음 | /api/posts/stats | 없음 |
| 인증 | login / refresh / logout / me | login / me | login / refresh / logout | login / refresh / logout |

인증 경로의 공통 접두사는 `/api/auth`입니다. 로그인 본문은 `antigravity_ide_gemini38`이 `loginId`, `userPw`를 사용하고 나머지는 `username`, `password`를 사용합니다.

`antigravity_gemini38`의 게시물 응답은 `ApiResponse`로 감싸며, 나머지는 목록 배열 또는 개별 객체를 직접 반환하는 방식입니다. URL 필드가 비슷해도 상태 값, 응답 구조, 인증 헤더가 다르므로 프로젝트별 프런트엔드와 백엔드를 짝지어 실행합니다.

## 8. 실행 방법

아래 명령은 **각 터미널의 시작 위치가 저장소 루트**인 Windows PowerShell 기준입니다. macOS/Linux에서는 `mvnw.cmd` 대신 `./mvnw`, `gradlew.bat` 대신 `./gradlew`, `npm.cmd` 대신 `npm`을 사용합니다.

공통 준비물은 해당 Java 버전, Node.js/npm, Oracle 연결 환경입니다. Node.js는 네 프로젝트를 함께 다룰 수 있도록 22.12 이상을 기준으로 준비할 수 있습니다. Wrapper와 npm 의존성의 최초 다운로드에는 네트워크가 필요합니다.

### 8.1 antigravity_gemini38

`backend/src/main/resources/application.yml`의 Oracle 접속 설정을 실제 환경에 맞춥니다. Redis 기본 주소는 `127.0.0.1:6379`이며 별도 Compose 파일은 없습니다. Redis 연결 실패 시 인증 토큰 저장을 메모리로 대체하는 코드가 있습니다.

```powershell
# 터미널 1: Java 17 백엔드
cd antigravity_gemini38/backend
.\gradlew.bat bootRun
```

```powershell
# 터미널 2: 프런트엔드
cd antigravity_gemini38/frontend
npm.cmd ci
npm.cmd run dev
```

### 8.2 antigravity_ide_gemini38

먼저 `TB_USER`, `TB_WATCHLATER`와 두 시퀀스가 준비되어 있는지 확인합니다. 앱이 테이블을 자동 생성하지 않습니다. `application.yml`의 Oracle 설정을 조정한 뒤 실행합니다.

```powershell
# 터미널 1: Java 17 백엔드
cd antigravity_ide_gemini38/backend
.\mvnw.cmd spring-boot:run
```

```powershell
# 터미널 2: 프런트엔드
cd antigravity_ide_gemini38/frontend
npm.cmd ci
npm.cmd run dev
```

### 8.3 codex_astra

처음 설정할 때 예시 파일을 복사하고 `DB_PASSWORD`, `JWT_SECRET`을 입력합니다. 기존 개인 설정이 있으면 유지합니다. JWT 키는 최소 32바이트의 충분히 무작위인 값을 사용합니다.

```powershell
cd codex_astra
if (-not (Test-Path backend/application-local.properties)) {
    Copy-Item backend/application-local.properties.example backend/application-local.properties
}
# 생성된 파일에 실제 DB_PASSWORD, JWT_SECRET 설정 후 실행
docker compose up -d redis
cd backend
.\mvnw.cmd spring-boot:run
```

```powershell
# 별도 터미널
cd codex_astra/frontend
npm.cmd ci
npm.cmd run dev
```

로컬 Redis는 호스트 `6380`을 사용합니다. 설정 파일은 백엔드의 작업 디렉터리에서 읽으므로 `backend`에서 실행해야 합니다.

### 8.4 codex_vs_astra

이 프로젝트의 개인 설정 파일은 `backend/config` 아래에 있습니다.

```powershell
cd codex_vs_astra
if (-not (Test-Path backend/config/application-local.properties)) {
    Copy-Item backend/config/application-local.properties.example backend/config/application-local.properties
}
# 생성된 파일에 실제 DB_PASSWORD, JWT_SECRET 설정 후 실행
docker compose up -d redis
cd backend
.\mvnw.cmd spring-boot:run
```

```powershell
# 별도 터미널
cd codex_vs_astra/frontend
npm.cmd ci
npm.cmd run dev
```

Redis 기본 포트는 `6379`입니다. 브라우저 주소는 기본 허용 출처인 `http://localhost:5173`으로 통일합니다. 다른 호스트를 쓰면 `ALLOWED_ORIGIN`도 조정합니다.

### 공통 접속 및 충돌 확인

| 항목 | 기본값 |
|---|---|
| 프런트엔드 | http://localhost:5173, codex_astra는 http://127.0.0.1:5173 |
| 백엔드 | http://localhost:8080 |
| Swagger UI | /swagger-ui/index.html, 경로 별칭은 개별 설정 참고 |
| OpenAPI JSON | /v3/api-docs |
| 개발 로그인 | stk1 / stk1 |

네 앱 모두 기본적으로 8080·5173을 사용하므로 처음에는 한 프로젝트씩 실행합니다. 동시에 실행하려면 백엔드 포트, `frontend/vite.config.ts`의 프록시, 필요한 CORS 출처를 함께 변경합니다. 두 Codex 프런트엔드는 `strictPort: true`라 5173 사용 중이면 시작에 실패합니다.

Compose는 Redis만 실행하며 Oracle·백엔드·프런트엔드는 포함하지 않습니다. 서버 종료는 해당 터미널에서 `Ctrl+C`, Redis 중지는 해당 프로젝트 폴더에서 `docker compose stop redis`로 처리합니다.

## 9. 테스트와 검증 범위

이 루트 문서 작성에서는 애플리케이션 빌드·DB 접속·테스트를 새로 실행하지 않았습니다. 아래 표는 **현재 확인한 테스트 코드와 명령의 존재**를 설명하며, 하위 README의 과거 성공 기록을 이번 실행 결과로 간주하지 않습니다.

| 폴더 | 백엔드 테스트 소스 | 프런트엔드 테스트 | 실제 API 점검 도구 |
|---|---|---|---|
| antigravity_gemini38 | WatchLaterApplicationTests의 contextLoads | 별도 test 스크립트 없음 | 별도 스크립트 없음 |
| antigravity_ide_gemini38 | src/test 테스트 소스 없음 | 별도 test 스크립트 없음 | 별도 스크립트 없음 |
| codex_astra | ApiIntegrationTest, YoutubeUrlTest | 별도 test 스크립트 없음 | scripts/smoke-test.ps1 |
| codex_vs_astra | BoardIntegrationTest, TokenServiceTest, YoutubeUrlTest | youtube.test.ts, Vitest | scripts/smoke-test.mjs |

각 프로젝트의 `backend`에서 실행할 명령:

| 폴더 | 테스트 | 패키징 |
|---|---|---|
| antigravity_gemini38 | `.\gradlew.bat test` | `.\gradlew.bat build` |
| antigravity_ide_gemini38 | `.\mvnw.cmd test` — 현재 테스트 소스 없음 | `.\mvnw.cmd package` |
| codex_astra | `.\mvnw.cmd test` | `.\mvnw.cmd package` |
| codex_vs_astra | `.\mvnw.cmd test` | `.\mvnw.cmd package` |

두 Codex 백엔드 테스트는 H2와 메모리 저장소 또는 Redis mock을 사용합니다. 실제 Oracle·Redis 연동을 전부 대체하지 않습니다. `antigravity_gemini38`의 contextLoads는 별도 테스트 DB 설정 없이 애플리케이션을 기동하므로 설정된 Oracle 및 초기화 로직의 영향을 받습니다.

모든 `frontend`에서 `npm.cmd run build`로 TypeScript 검사와 Vite 빌드를 수행할 수 있습니다. `npm.cmd test`는 `codex_vs_astra/frontend`에만 정의되어 있습니다.

실제 Oracle·Redis·백엔드를 실행한 뒤 해당 프로젝트 루트에서 다음 도구를 사용할 수 있습니다.

```powershell
# codex_astra 폴더에서
.\scripts\smoke-test.ps1

# codex_vs_astra 폴더에서
node scripts/smoke-test.mjs
```

스모크 테스트는 실제 게시물을 생성·수정·삭제하는 쓰기 작업입니다. 대상 서버와 계정을 확인하고 실행합니다. 화면 확인은 비로그인 목록 → 로그인 → 등록 → 필터/보기 전환 → 수정·완료 처리 → 삭제 → 새로고침 인증 유지 순서로 진행할 수 있습니다.

## 10. 구현을 읽는 순서와 확장 시 고려사항

| 비교 목적 | 우선 살펴볼 폴더·파일 | 확인할 내용 |
|---|---|---|
| 계층별 구조와 서버 검색 | antigravity_gemini38의 controller/service/repository/mapper | Querydsl 검색과 MyBatis 통계 역할 분리 |
| 기존 DB 기반 CRUD | antigravity_ide_gemini38의 WatchLaterService.java | 조회수 증가, 상태 토글, 논리 삭제 |
| 카드·표 UI와 버전 검사 | codex_astra의 main.tsx, PostController.java | 한 화면의 상태 관리, 수정·삭제 충돌 검사 |
| 기능별 패키지와 테스트 | codex_vs_astra의 auth/config/post, frontend/src/pages | 인증·게시물 분리, URL·토큰 테스트 |

유지보수 관점에서는 다음 차이를 고려합니다.

- `codex_astra`는 화면과 폼 로직이 `main.tsx`에 집중되어 흐름을 한곳에서 볼 수 있지만, 기능이 커지면 컴포넌트 분리를 검토할 수 있습니다.
- `antigravity_gemini38`은 서버 검색을 구현하므로 다른 세 구현의 브라우저 검색과 API 부하·응답 범위가 다릅니다. 모두 페이징이 없어 데이터 증가 시 전체 조회 비용을 고려해야 합니다.
- `antigravity_ide_gemini38`만 논리 삭제와 조회수를 보유합니다. 다른 스키마로 옮길 때 상태 값뿐 아니라 삭제 이력·조회수 처리도 결정해야 합니다.
- 두 Antigravity 설정에는 DB 비밀번호와 JWT 키가 직접 들어 있습니다. 재사용 시 환경별 설정으로 분리할 대상이며, 이 문서에는 실제 비밀값을 반복 기재하지 않습니다.
- 폴더마다 기본 사용자 생성, 토큰 갱신, 스키마 변경 정책이 다르므로 기존 데이터가 있는 환경에서는 해당 소스부터 확인합니다.

## 11. 상세 문서와 화면 자료

- [antigravity_gemini38 개발 가이드](antigravity_gemini38/README.md) · [화면 캡처](antigravity_gemini38/capture/)
- [antigravity_ide_gemini38 개발 가이드](antigravity_ide_gemini38/README.md) · [화면 캡처](antigravity_ide_gemini38/capture/)
- [codex_astra 개발 가이드](codex_astra/README.md) · [화면 캡처](codex_astra/capture/) · [검증 화면](codex_astra/docs/watchlater-screen.jpg)
- [codex_vs_astra 개발 가이드](codex_vs_astra/README.md) · [화면 캡처](codex_vs_astra/capture/)
- [TB_USER·TB_WATCHLATER SQL](db_sql/ddl.sql)

하위 README에 과거 폴더명이 남아 있는 경우 현재 루트의 폴더명과 위 상대 링크를 기준으로 접근합니다. 요구사항은 각 `prompt.md`, 기술 기준은 `rules.md`, 실제 동작은 소스와 설정을 기준으로 확인합니다.
