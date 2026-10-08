# Watchlater — YouTube 영상 공유게시판

좋은 YouTube 영상을 등록하고 함께 확인하는 웹 앱입니다. 첫 화면에서 전체 게시물을 최신순으로 보여주며 **서버·화면 모두 페이징을 사용하지 않습니다.**

## 1. 구현 범위

| 기능 | 동작 |
| --- | --- |
| 첫 화면 전체 목록 | 로그인 없이 모든 게시물 조회, 등록일·ID 내림차순 |
| 로그인 | 기본 개발 계정 `stk1` / `stk1`, 로그인 폼에도 기본값 입력 |
| 등록 | 제목, YouTube URL, 내용, 신규·완료 구분 |
| 수정 | 제목, URL, 내용, 상태 변경 |
| 상태 전환 | 카드 및 표에서 신규 ↔ 완료 변경 |
| 삭제 | 확인 대화상자 후 삭제, 삭제 후 복구 기능 없음 |
| 바로가기 | 썸네일·바로가기 링크로 YouTube 새 탭 열기 |
| 상세 보기 | 제목 클릭 시 전체 내용과 등록·수정일 확인 |
| 목록 표시 | 카드 보기 / AG Grid 표 보기 |
| 검색·필터 | 제목·내용 검색, 전체·신규·완료 필터, 전체/신규/완료 건수 |
| 오류 처리 | 목록 재시도, 입력 검증, 로그인 실패, 수정 충돌 안내 |
| 반응형 | 데스크톱 사이드바, 모바일 단일 카드 목록 |

읽기는 공개이며 등록·수정·삭제는 로그인해야 합니다. 공유게시판 정책으로 **로그인한 사용자는 모든 게시물을 관리**할 수 있습니다. 작성자별 소유권 제한, 회원가입, 관리자 기능은 구현 범위에 포함하지 않았습니다.

내용은 선택 입력입니다. 제목은 200자, URL은 1,000자, 내용은 10,000자로 제한합니다. 입력은 일반 텍스트로 표시하며 HTML을 실행하지 않습니다.

## 2. 기술 스택

`rules.md`를 기준으로 구성했습니다.

| 구분 | 적용 기술·역할 |
| --- | --- |
| 프런트엔드 | React 19, TypeScript, Vite |
| UI | Ant Design 6, Ant Design Icons, AG Grid Community |
| 라우팅 | React Router 7, URL 검색 파라미터로 상태 필터 유지 |
| 서버 상태 | TanStack Query 5: 목록·통계 조회, 변경 후 무효화 |
| HTTP | Axios: 인증 헤더, 만료 시 토큰 갱신 및 1회 재시도 |
| 클라이언트 상태 | Zustand: 액세스 토큰·사용자 정보의 메모리 저장 |
| 백엔드 | Java 21, Spring Boot 4.0.3, Spring Web MVC |
| 인증 | Spring Security, JWT HS256, BCrypt |
| DB 쓰기 | Spring Data JPA / Hibernate, 트랜잭션, 낙관적 잠금 |
| DB 목록 | Querydsl JPA 7.1(OpenFeign 유지보수 배포판), PathBuilder |
| DB 통계 | MyBatis 4.0.0, 조건부 합계 SQL |
| DB | Oracle 18c XE, Oracle JDBC, Flyway |
| Redis | Redis 7.4: 갱신 토큰 보관·원자적 소비, 로그인 시도 횟수 제한 |
| API 문서 | Springdoc OpenAPI 3.0.1 / Swagger UI |
| 검증 | JUnit 5, Spring Boot 통합 테스트, H2 Oracle 모드, 실제 Oracle·Redis 스모크 테스트 |

백엔드 패키지는 **`kr.co.tkinfo.watchlater`**입니다. 모든 소스·SQL·HTTP 요청/응답은 UTF-8을 사용합니다.

Oracle 18c는 Hibernate 7 기본 `OracleDialect`의 최소 버전(19c)보다 오래되어, `hibernate-community-dialects`의 `OracleLegacyDialect`를 명시했습니다. 커뮤니티 방언은 Hibernate 핵심 지원 범위와 다르며, 이 앱이 사용하는 SQL은 실제 Oracle 18c에서 별도 검증합니다. [Hibernate 공식 방언 문서](https://docs.hibernate.org/orm/7.2/dialect/)

Redis는 현재 필요한 갱신 토큰과 로그인 제한에 사용합니다. 게시물 캐시와 별도 분산락은 추가하지 않았으며, 동시 수정은 DB 버전 필드로 처리합니다.

## 3. 디렉터리 구조

```text
.
├─ rules.md                         기술 스택 기준
├─ compose.yaml                     앱 전용 Redis, 호스트 6380
├─ scripts/smoke-test.ps1            실제 API·Oracle·Redis 통합 점검
├─ backend/
│  ├─ pom.xml
│  ├─ mvnw / mvnw.cmd               Maven 3.9.11 Wrapper
│  ├─ application-local.properties.example
│  ├─ application-local.properties  개인 설정, Git 제외
│  ├─ tools/InspectDatabase.java    읽기 전용 DB 객체·이력 확인
│  └─ src/
│     ├─ main/java/kr/co/tkinfo/watchlater/
│     │  ├─ WatchlaterApplication.java
│     │  ├─ SecurityConfig.java     JWT 검증, 보안 필터, 기본 계정 생성
│     │  ├─ AuthController.java     로그인·갱신·로그아웃
│     │  ├─ SessionStore.java       토큰 저장소 인터페이스
│     │  ├─ RedisSessionStore.java  실제 Redis 구현
│     │  ├─ PostController.java     DTO, 조회·쓰기·상태 변경
│     │  ├─ PostStatsMapper.java    MyBatis 통계 SQL
│     │  ├─ VideoPost.java          게시물 엔티티
│     │  ├─ UserAccount.java        사용자 엔티티
│     │  ├─ PostRepository.java / UserRepository.java
│     │  ├─ YoutubeUrl.java         YouTube URL 허용 목록 검증
│     │  └─ ApiErrors.java          공통 오류 응답
│     ├─ main/resources/
│     │  ├─ application.yml
│     │  └─ db/migration/V1__watchlater.sql
│     └─ test/java/kr/co/tkinfo/watchlater/
│        ├─ ApiIntegrationTest.java
│        └─ YoutubeUrlTest.java
└─ frontend/
   ├─ package.json / package-lock.json
   ├─ vite.config.ts
   └─ src/
      ├─ main.tsx                   화면·폼·쿼리·라우팅
      ├─ api.ts                     Axios·인증·Zustand
      └─ styles.css                 레이아웃·반응형
```

## 4. 개발 환경 준비

- JDK 21
- Node.js 20.19 이상 또는 22.12 이상 권장, npm
- Docker Desktop(또는 별도 Redis)
- Oracle 서버 `192.168.45.2:1521/XEPDB1`에 접근 가능한 네트워크
- 최초 Maven/npm 의존성 설치 시 인터넷 연결

Oracle 접속 계정은 `USERSTK9`입니다. 제공된 DB 비밀번호와 무작위 JWT 서명 키는 현재 개발 PC의 `backend/application-local.properties`에 설정했으며, `.gitignore`로 제외했습니다. 비밀번호와 실제 서명 키는 이 문서에 기재하지 않습니다.

다른 PC에서는 다음과 같이 설정 파일을 복사하고 값을 입력합니다. **기존 설정 파일이 있으면 덮어쓰지 마세요.**

```powershell
cd backend
Copy-Item application-local.properties.example application-local.properties
```

JWT 키는 임의의 32바이트 이상 문자열로 지정합니다. PowerShell 7에서 생성 예시:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

### 설정 항목

| 환경변수/프로퍼티 | 기본값·설명 |
| --- | --- |
| `DB_URL` | `jdbc:oracle:thin:@//192.168.45.2:1521/XEPDB1` |
| `DB_USERNAME` | `USERSTK9` |
| `DB_PASSWORD` | 필수, 로컬 설정 또는 환경변수 |
| `JWT_SECRET` | 필수, 최소 32바이트, 재시작 간 동일한 키 유지 |
| `REDIS_HOST` | `localhost` |
| `REDIS_PORT` | `6380` |
| `REDIS_PASSWORD` | 기본 빈 값; 외부 Redis 사용 시 지정 |
| `PORT` | `8080` |
| `COOKIE_SECURE` | 로컬 HTTP는 `false`, HTTPS 운영 환경은 `true` |
| `SEED_USERNAME` | `stk1`, 처음 없는 계정만 생성 |
| `SEED_PASSWORD` | `stk1`, 생성 시 BCrypt로 해시 |

`application-local.properties`는 **백엔드 프로세스의 현재 디렉터리**에서 읽습니다. 따라서 다음 실행 명령은 `backend` 폴더에서 실행합니다. 기존 계정은 재시작 시 비밀번호가 초기화되지 않습니다. `SEED_PASSWORD` 변경은 이미 생성된 계정의 비밀번호 변경 기능이 아닙니다.

## 5. 실행

각 서버를 별도 터미널에서 실행합니다.

### 5.1 Redis — 프로젝트 루트

```powershell
docker compose up -d redis
docker compose ps
```

기존 Redis의 6379 포트와 충돌하지 않도록 **호스트 `127.0.0.1:6380` → 컨테이너 `6379`**로 연결합니다. 데이터는 이름 있는 Docker 볼륨에 유지됩니다.

### 5.2 백엔드

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

또는 패키징 후 실행:

```powershell
cd backend
.\mvnw.cmd package
java -jar target/watchlater-0.0.1-SNAPSHOT.jar
```

macOS/Linux에서는 `./mvnw`를 사용합니다. 최초 실행 시 Flyway 마이그레이션을 적용하고 기본 계정을 생성합니다.

### 5.3 프런트엔드

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

- 앱: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- API: [http://127.0.0.1:8080/api/posts](http://127.0.0.1:8080/api/posts)
- Swagger UI: [http://127.0.0.1:8080/swagger-ui.html](http://127.0.0.1:8080/swagger-ui.html)
- OpenAPI JSON: [http://127.0.0.1:8080/v3/api-docs](http://127.0.0.1:8080/v3/api-docs)
- 기본 로그인: **`stk1` / `stk1`**

Vite가 `/api`를 8080 백엔드로 프록시합니다. 브라우저는 같은 출처로 요청하며 별도 CORS 설정이 필요 없습니다. 포트를 바꾸면 `vite.config.ts`의 프록시 대상도 변경하세요.

종료는 각 서버 터미널에서 `Ctrl+C`, Redis 종료는 프로젝트 루트에서 `docker compose stop redis`입니다.

## 6. 데이터베이스와 마이그레이션

기존 개발 스키마에 `WL_USERS` 등의 다른 객체가 있어 이 앱은 **`WL_ASTRA_` 이름 공간**을 사용합니다.

| 객체 | 역할 |
| --- | --- |
| `WL_ASTRA_USERS` | 사용자 ID, BCrypt 비밀번호 해시 |
| `WL_ASTRA_POSTS` | 영상 게시물 |
| `WL_ASTRA_POST_SEQ` | 게시물 PK 시퀀스, 증가량 1 |
| `WL_ASTRA_POST_CREATED_IDX` | 최신 등록순 인덱스 |
| `WL_ASTRA_SCHEMA_HISTORY` | 이 앱 전용 Flyway 이력 |

게시물 컬럼:

| 컬럼 | 타입·의미 |
| --- | --- |
| `ID` | `NUMBER(19)`, PK |
| `TITLE` | `VARCHAR2(200 CHAR)`, 필수 |
| `VIDEO_URL` | `VARCHAR2(1000 CHAR)`, 정규화된 YouTube 주소 |
| `VIDEO_ID` | `VARCHAR2(11 CHAR)`, 썸네일·링크용 ID |
| `CONTENT` | `CLOB`, 내용 |
| `STATUS` | `NEW` 또는 `DONE`, DB CHECK 제약 |
| `AUTHOR` | 사용자 ID, 사용자 테이블 FK |
| `CREATED_AT`, `UPDATED_AT` | `TIMESTAMP WITH TIME ZONE` |
| `VERSION` | `NUMBER(19)`, JPA 낙관적 잠금 버전 |

Hibernate는 `ddl-auto=validate`로 스키마를 검증만 합니다. 스키마 변경은 `V2__...sql` 같은 새 Flyway 파일로 작성하세요. 적용된 마이그레이션 파일을 수정하면 체크섬 검증에 실패합니다.

공유 개발 스키마를 지원하기 위해 Flyway 이력 테이블을 분리하고 baseline version을 `0`으로 설정했습니다. 기존 스키마에 객체가 있어도 V1이 실행됩니다. `clean-disabled=true`로 Flyway 전체 스키마 삭제를 막았습니다. 같은 접두사로 이미 다른 앱을 설치했다면 운영자가 이름과 이력을 먼저 확인해야 합니다.

Oracle은 빈 문자열을 NULL로 저장하므로 API 응답에서 빈 내용을 `""`로 보정합니다. 한국어가 정상 저장되려면 DB 문자셋도 한글을 지원해야 하며, 제공된 서버에서는 실제 한글·줄바꿈 저장과 조회를 확인했습니다.

## 7. API 명세

기본 경로는 `/api`, JSON 응답입니다. 보호 API는 `Authorization: Bearer <accessToken>`이 필요합니다.

| 메서드 | 경로 | 인증 | 기능 |
| --- | --- | --- | --- |
| POST | `/auth/login` | 공개, 전용 헤더 필요 | 로그인·토큰 발급 |
| POST | `/auth/refresh` | 갱신 쿠키, 전용 헤더 필요 | 토큰 회전 |
| POST | `/auth/logout` | 갱신 쿠키, 전용 헤더 필요 | 갱신 토큰 삭제·쿠키 제거 |
| GET | `/posts` | 공개 | 전체 목록, 페이징 없음 |
| GET | `/posts/stats` | 공개 | 전체·신규·완료 건수 |
| POST | `/posts` | 로그인 | 등록, 201 |
| PUT | `/posts/{id}` | 로그인 | 전체 수정·상태 변경 |
| DELETE | `/posts/{id}?version={version}` | 로그인 | 삭제, 204 |

로그인 요청:

```json
{ "username": "stk1", "password": "stk1" }
```

로그인·갱신 응답에는 `accessToken`, `username`만 포함됩니다. 갱신 토큰은 JSON 응답에 포함하지 않습니다.

등록 예시:

```json
{
  "title": "함께 보고 싶은 영상",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "content": "추천하는 이유를 적어 주세요.",
  "status": "NEW"
}
```

수정 요청은 위 항목에 목록에서 받은 최신 `version`을 추가합니다. 등록 시 `version`은 보내지 않아도 됩니다. 수정·삭제 요청의 버전이 다르면 **409 Conflict**로 처리합니다. 이때 목록을 새로고침하고 편집창을 다시 여세요.

주요 응답 코드는 400(입력값/URL 오류), 401(로그인 필요/인증 실패), 403(인증 요청 보안 헤더 누락), 404(없는 게시물), 409(동시 수정 충돌), 429(로그인 시도 제한), 503(Redis 연결 실패)입니다. 화면용 오류 메시지는 `{"message":"..."}` 형식입니다.

### YouTube URL 정책

`youtube.com`, `www.youtube.com`, `m.youtube.com`, `music.youtube.com`의 `/watch?v=...`, `/shorts/...`, `/embed/...`, `/live/...` 및 `youtu.be/...`를 허용합니다. ID는 영문·숫자·`_`·`-` 11자리입니다. 위장 도메인, 사용자 정보가 포함된 주소, 별도 포트, 재생목록 전용 링크, 비 YouTube URL은 거절합니다.

저장 시 `https://www.youtube.com/watch?v={ID}`로 정규화하므로 원래 URL의 시작 시간·공유 추적 파라미터는 저장되지 않습니다. YouTube API 키는 필요 없으며, 영상 존재 여부·공개 여부는 검증하지 않습니다. 썸네일은 `i.ytimg.com`에서 불러옵니다.

## 8. 인증 흐름

1. 로그인 시 Oracle에 저장된 BCrypt 해시로 비밀번호를 확인합니다.
2. HS256 JWT 액세스 토큰을 발급합니다. 유효기간은 **15분**이며 Zustand 메모리에만 저장합니다. localStorage/sessionStorage에 저장하지 않습니다.
3. 무작위 갱신 토큰의 SHA-256 해시를 Redis 키로, 사용자 ID를 값으로 저장합니다. TTL은 **7일**입니다.
4. 브라우저에는 `wl_refresh` HttpOnly·SameSite=Strict 쿠키로 전달합니다. 쿠키 경로는 `/api/auth`입니다.
5. 새로고침 시 쿠키로 세션을 복구합니다. 보호 API에서 401이 발생하면 갱신 후 원래 요청을 한 번 재시도합니다. 같은 탭에서 여러 갱신 요청은 하나의 Promise로 합칩니다.
6. 갱신 시 Redis `GETDEL`로 기존 토큰을 원자적으로 소비하고 새 토큰을 발급합니다. 소비한 토큰은 재사용할 수 없습니다.
7. 로그아웃은 Redis 갱신 토큰과 쿠키를 제거하고 메모리 인증 상태를 비웁니다.

모든 인증 POST는 `X-Requested-With: XMLHttpRequest` 헤더가 필요합니다. 크로스 오리진 요청을 허용하지 않아 외부 사이트는 이 헤더로 인증 POST를 보낼 수 없습니다. 이 구조와 SameSite 쿠키를 전제로 CSRF 기본 필터를 비활성화했습니다. CORS를 확장할 때는 CSRF 정책도 함께 재검토해야 합니다.

로그인 제한은 클라이언트 IP 기준 1분당 20회이며 Redis Lua 스크립트로 원자적으로 집계합니다. 리버스 프록시 환경에서는 현재 백엔드가 인식하는 IP가 프록시 IP일 수 있습니다.

JWT는 서버 세션이 없어 로그아웃 전에 탈취된 액세스 토큰은 최대 15분 동안 유효합니다. 즉시 JWT 폐기용 차단 목록은 구현하지 않았습니다. 여러 브라우저 탭이 동시에 갱신하면 먼저 소비한 요청만 성공하므로 나머지 탭은 재로그인이 필요할 수 있습니다.

## 9. 테스트와 검증

2026-10-08 개발 검증 결과:

- 백엔드 자동 테스트 **15개 성공**, 실패·오류 0건
- 실행 JAR 패키징 성공
- 프런트엔드 TypeScript 검사 및 프로덕션 빌드 성공
- 실제 Oracle 18c XE에서 Flyway V1 적용과 스키마 검증 성공
- 실제 Oracle·Redis 대상으로 한글·줄바꿈 등록, 전체 조회, 제목·내용·상태 수정, 통계, 토큰 갱신, 테스트 게시물 삭제 성공
- 브라우저에서 목록의 빈 상태, 기본 계정 로그인, 등록 폼 필수값 검증, 새로고침 시 로그인 복구 확인
- 검증용 게시물은 제거했으며 초기 데이터는 빈 목록입니다. [검증 화면](docs/watchlater-screen.jpg)

### 자동 테스트 — 외부 DB/Redis 불필요

```powershell
cd backend
.\mvnw.cmd test
```

15개 테스트를 구성했습니다. H2 Oracle 모드와 테스트 전용 메모리 SessionStore를 사용하며 실제 개발 DB를 수정하지 않습니다.

- 올바른 YouTube 주소 6가지와 잘못된 주소 8가지 검증
- 공개 목록 조회와 미로그인 쓰기 차단
- 기본 로그인 성공, 잘못된 비밀번호 실패
- 인증 요청 CSRF 방어 헤더 검사
- 한글 등록, URL 정규화, 수정·완료 전환, 통계 조회
- 잘못된 URL·공백 제목 거절
- 오래된 버전의 수정·삭제 충돌
- 삭제와 없는 게시물 404
- 갱신 토큰 회전, 재사용 거절, 로그아웃 후 갱신 거절

### 실제 Oracle·Redis API 테스트

백엔드와 Redis를 실행한 다음 프로젝트 루트에서:

```powershell
.\scripts\smoke-test.ps1
```

이 스크립트는 `[자동 검증]` 게시물 **한 건을 실제로 생성·수정하고, 자신이 만든 ID만 finally에서 삭제**합니다. 테스트 계정을 변경하려면 `-Username`, `-Password`, 서버를 변경하려면 `-BaseUrl`을 전달합니다. 토큰·비밀번호는 출력하지 않습니다.

### 프런트엔드 타입 검사·프로덕션 빌드

```powershell
cd frontend
npm.cmd run build
```

빌드 산출물은 `frontend/dist`입니다. Ant Design과 AG Grid를 포함해 초기 JS 크기에 대한 Vite 경고가 발생할 수 있으며 빌드 오류는 아닙니다. 대규모 서비스로 확장할 때 표 보기의 지연 로딩을 고려할 수 있습니다.

브라우저 수동 검증 순서: 비로그인 전체 목록 → 로그인 → 등록 폼 필수값 확인 → 등록 → 카드·표 보기 → 검색·상태 필터 → 내용 수정 → 완료 표시 → 새로고침 로그인 복구 → 삭제 확인 → 로그아웃.

## 10. 운영 및 문제 해결

- **Oracle 연결 실패:** VPN/LAN, `192.168.45.2:1521`, 서비스명 `XEPDB1`, 계정 상태와 테이블·시퀀스 생성 권한을 확인합니다.
- **로그인이 503으로 실패:** `docker compose ps`, `docker compose logs redis`, `REDIS_PORT=6380`을 확인합니다.
- **포트 충돌:** 다른 프로세스를 임의 종료하지 말고 앱 포트와 프록시 설정을 함께 변경합니다. Vite는 5173 충돌 시 다른 포트로 조용히 이동하지 않고 실패합니다.
- **설정 파일을 못 읽음:** 백엔드를 `backend` 디렉터리에서 실행했는지 확인합니다.
- **JWT 키 오류:** `JWT_SECRET`이 32바이트 이상인지 확인합니다.
- **수정 충돌:** 새로고침 후 해당 게시물의 편집창을 다시 열어 최신 버전으로 수정합니다.
- **썸네일이 안 보임:** 외부 이미지 호스트 접속을 확인합니다. 이미지 로딩 실패 시 기본 재생 아이콘을 표시합니다.
- **운영 배포:** `dist`를 정적 웹 서버에서 제공하고 `/api`는 백엔드로 프록시합니다. React Router를 위해 나머지 경로는 `index.html`로 연결합니다. HTTPS에서는 `COOKIE_SECURE=true`, 기본 개발 계정 교체, DB·Redis 접근 제한, 비밀값의 환경변수 관리를 적용합니다.
- **기본 계정:** `stk1/stk1`은 요청된 개발용 설정입니다. 별도 계정 관리 화면은 없습니다.
- **목록 규모:** 요구사항대로 모든 데이터를 한 번에 가져옵니다. 데이터가 매우 많아지면 전체 조회·CLOB 전송·표 렌더링 비용이 증가합니다.
- **문서 노출:** 운영에서 필요 없으면 `springdoc.api-docs.enabled=false`, `springdoc.swagger-ui.enabled=false`로 문서 경로를 닫습니다.

### 참고한 공식 문서

- [MyBatis Spring Boot 호환성](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)
- [Flyway Oracle 지원](https://documentation.red-gate.com/flyway/reference/database-driver-reference/oracle-database)
- [Hibernate 방언 및 레거시 DB 지원](https://docs.hibernate.org/orm/7.2/dialect/)
