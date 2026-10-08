# Watch Later — YouTube 영상 공유 게시판

좋은 YouTube 영상을 등록하고 팀과 함께 보는 한국어 게시판입니다. 첫 화면에서 페이징 없이 전체 목록을 표시하며, 로그인한 사용자는 게시물을 등록·수정·삭제할 수 있습니다.

## 1. 구현 범위와 사용 방법

| 기능 | 동작 |
|---|---|
| 첫 페이지 | 비로그인 상태에서도 전체 게시물 조회, 최신 등록 순 정렬 |
| 로그인 | 기본 계정 `stk1` / `stk1`, 최초 실행 시 BCrypt 해시로 DB에 자동 등록 |
| 게시물 등록 | 제목, YouTube 영상 URL, 내용, 신규/완료 선택 |
| 게시물 수정 | 제목, URL, 내용, 상태 변경; 동시 수정 시 409 충돌 안내 |
| 게시물 삭제 | 상세 화면에서 삭제, 확인창 승인 후 삭제 |
| 영상 바로가기 | 목록의 `영상 보기` 또는 상세 화면에서 YouTube를 새 탭으로 열기 |
| 목록 탐색 | 전체/신규/완료 필터, 제목·내용·등록자 검색, 열 정렬 |
| 상세 보기 | 목록의 영상 제목 클릭 → 상세 패널 |
| 로그인 유지 | 메모리 Access Token + HttpOnly Cookie Refresh Token + Redis |

**권한 정책:** 공개 조회, 로그인 사용자 전체가 공유 게시물을 수정·삭제하는 단일 팀 게시판입니다. 작성자 전용 권한, 회원가입, 관리자 화면은 범위에 포함하지 않았습니다. `신규/완료`는 게시물의 공유 상태로 저장됩니다. 등록 기본값은 신규입니다. 로그인 입력란에는 비밀번호를 자동 기입하지 않으며 기본 계정은 서버에 등록됩니다.

## 2. 기술 스택

`rules.md` 기준으로 구성했습니다.

- Frontend: React 19, TypeScript, Vite, TanStack Query, React Router, Axios, Zustand, Ant Design, AG Grid Community.
- Backend: Java 21, Spring Boot 4.0.3, Spring Web MVC, Spring Security, Spring Data JPA / Hibernate, Querydsl 5.1 Jakarta, MyBatis 4.0.
- Database: Oracle 18c XE, Flyway 마이그레이션, Oracle JDBC.
- 인증: HS256 JWT, BCrypt, Redis 7.4.
- API 문서: springdoc-openapi 3.0.3, Swagger UI.
- 소스·HTTP·빌드 인코딩: UTF-8.

Spring Boot 4와 Java 호환성은 [Spring 공식 문서](https://docs.spring.io/spring-boot/4.0/system-requirements.html), OpenAPI 통합은 [springdoc 공식 문서](https://springdoc.org/)를 참고했습니다. 정확한 프런트엔드 설치 버전은 `frontend/package-lock.json`에 고정됩니다.

### 데이터 접근 역할

- JPA: 게시물 저장·수정·삭제, 트랜잭션, `@Version` 낙관적 잠금.
- Querydsl: 전체 게시물 조회 및 최신 순 정렬. `PathBuilder`를 사용하므로 Q 클래스 생성 과정이 없습니다.
- MyBatis: 로그인 계정 조회 및 기본 계정 생성.
- Redis: Refresh Token 해시 키 저장, 7일 TTL, 원자적 `GETDEL`로 갱신 토큰의 중복 사용 방지.

목록은 Oracle에서 직접 조회합니다. 현재 기능에 불필요한 목록 캐시 및 별도 분산락은 추가하지 않았습니다. 토큰 회전 경쟁은 Redis 원자 명령으로 처리합니다.

## 3. 디렉터리

```text
backend/
  config/application-local.properties.example  로컬 설정 예시
  pom.xml                                     Maven 의존성
  src/main/java/kr/co/tkinfo/watchlater/
    auth/                                     계정, JWT, Refresh Cookie
    config/                                   보안, CORS, 예외 처리
    post/                                     게시물 API, 서비스, 엔티티, URL 검증
  src/main/resources/
    application.yml
    db/migration/V1__create_watchlater.sql
  src/test/java/kr/co/tkinfo/watchlater/        통합·단위 테스트
frontend/
  src/pages/                                  게시판, 로그인
  src/components/PostEditor.tsx               등록·수정 공용 폼
  src/api.ts                                  Axios, 토큰 갱신, API 함수
  src/auth.ts                                 Zustand 메모리 인증 상태
  src/style.css                               반응형 한국어 UI
compose.yaml                                  로컬 Redis
```

## 4. 개발 환경 및 실행

필수: Java 21, Maven 3.6.3 이상 또는 Maven Wrapper, Node.js 22.12 이상, npm, Oracle 서버 네트워크 연결, Redis 6.2 이상. 권장 Redis 실행 방법은 Docker Compose입니다.

`backend/mvnw.cmd`와 `backend/mvnw`가 포함되어 있어 Maven을 별도 설치하지 않아도 됩니다. 최초 실행은 Maven 3.9.11 다운로드를 위해 인터넷 연결이 필요합니다. 아래 명령은 Windows PowerShell 기준이며 macOS/Linux에서는 `.\mvnw.cmd` 대신 `./mvnw`를 사용합니다.

### 4.1 Oracle 설정

기본 접속 주소는 `jdbc:oracle:thin:@//192.168.45.2:1521/XEPDB1`, 계정은 `USERSTK9`입니다. 사용자에게 전달받은 DB 비밀번호와 생성한 JWT 비밀키는 Git 제외 파일 `backend/config/application-local.properties`에 저장했습니다. 이 파일은 공개하거나 커밋하지 않습니다.

새 환경에서는 다음과 같이 예시 파일을 복사하고 값을 입력합니다.

```powershell
Copy-Item backend/config/application-local.properties.example backend/config/application-local.properties
```

```properties
DB_PASSWORD=실제_DB_비밀번호
JWT_SECRET=32바이트_이상의_충분히_무작위인_비밀키
```

PowerShell에서 무작위 키를 만드는 예:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

DB 계정은 자신의 스키마에 테이블·인덱스를 생성할 권한과 테이블스페이스 quota가 필요합니다. 기존 테이블은 변경하지 않고 `WLC_` 접두사 테이블만 생성합니다. 기존 스키마에서도 적용할 수 있도록 Flyway 이력 테이블을 `WLC_FLYWAY_HISTORY`, baseline 버전을 `0`으로 지정했습니다. 이미 같은 이름의 테이블이 있다면 실행 전에 기존 구조와 충돌 여부를 확인합니다.

### 4.2 Redis 실행

프로젝트 루트에서 Docker Desktop의 Linux 엔진을 실행한 후:

```powershell
docker compose up -d redis
docker compose exec redis redis-cli ping
```

`PONG`이 응답해야 합니다. Docker 포트는 로컬 `127.0.0.1:6379`에만 바인딩됩니다. 외부 Redis를 사용한다면 `REDIS_HOST`, `REDIS_PORT`, 필요한 경우 `REDIS_PASSWORD`를 설정합니다.

### 4.3 백엔드 실행

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

반드시 `backend` 디렉터리에서 실행합니다. 로컬 설정 파일의 상대 경로 기준이 실행 디렉터리이기 때문입니다. 기동 시 Flyway 테이블 생성 → Hibernate 스키마 검증 → 기본 계정 등록 순서로 실행됩니다. 기존 `stk1` 계정이 있으면 암호를 덮어쓰지 않습니다.

- API: `http://localhost:8080/api/posts`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### 4.4 프런트엔드 실행

다른 터미널에서:

```powershell
cd frontend
npm ci
npm run dev
```

`http://localhost:5173` 접속 → `로그인` → `stk1` / `stk1` → `영상 공유하기`.

Vite가 `/api`를 `localhost:8080`으로 프록시합니다. 브라우저 주소는 `localhost`로 통일합니다. `127.0.0.1`이나 다른 호스트로 접속하려면 `ALLOWED_ORIGIN`도 동일한 출처로 변경해야 합니다.

## 5. 환경 설정

| 변수 | 기본값 / 용도 |
|---|---|
| DB_URL | `jdbc:oracle:thin:@//192.168.45.2:1521/XEPDB1` |
| DB_USERNAME | `USERSTK9` |
| DB_PASSWORD | 필수, 로컬 파일 또는 환경 변수 |
| JWT_SECRET | 필수, 32바이트 이상, 모든 백엔드 인스턴스에서 동일한 값 |
| REDIS_HOST / REDIS_PORT | `localhost` / `6379` |
| REDIS_PASSWORD | 빈 값 |
| COOKIE_SECURE | 개발 `false`, HTTPS 운영에서는 `true` |
| ALLOWED_ORIGIN | `http://localhost:5173`, 브라우저 실제 origin |
| SEED_ENABLED | `true`, 최초 계정 생성 후 운영에서는 `false` 권장 |
| SEED_USERNAME / SEED_PASSWORD | `stk1` / `stk1`, 신규 시드 계정에만 적용 |

같은 키가 있으면 OS 환경 변수가 로컬 파일보다 우선합니다. 운영에서 기본 계정과 암호를 유지하지 않습니다. 기본 암호 변경 UI는 제공하지 않으므로 DB BCrypt 해시를 관리 절차에 따라 갱신하거나 시드 전에 별도 초기 계정을 지정합니다.

## 6. API 계약

| 메서드 | 주소 | 인증 | 설명 |
|---|---|---|---|
| GET | `/api/posts` | 공개 | 배열로 전체 목록 반환 |
| POST | `/api/posts` | Bearer | 등록, 201 |
| PUT | `/api/posts/{id}` | Bearer | 전체 필드 수정, 200 |
| DELETE | `/api/posts/{id}` | Bearer | 삭제, 204 |
| POST | `/api/auth/login` | 공개 + 지정 헤더 | 로그인, Access Token 및 쿠키 발급 |
| POST | `/api/auth/refresh` | Refresh Cookie + 지정 헤더 | 토큰 회전 |
| POST | `/api/auth/logout` | Refresh Cookie + 지정 헤더 | Redis 토큰 폐기, 쿠키 만료, 204 |

인증 API는 `X-Watchlater-Client: 1` 헤더가 필요합니다. 브라우저의 `Origin`이 있으면 `ALLOWED_ORIGIN`과 일치해야 합니다. Cookie는 `HttpOnly; SameSite=Strict; Path=/api/auth`로 발급됩니다. 임의 출처가 쿠키 기반 인증 API를 호출하지 못하도록 헤더와 출처를 검사하며 CORS 허용 출처는 하나로 제한합니다.

등록 요청 예:

```json
{
  "title": "함께 보고 싶은 영상",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "content": "추천 이유와 함께 나누고 싶은 이야기",
  "status": "NEW"
}
```

수정은 위 필드에 조회 응답의 `version` 값을 추가합니다. 상태는 `NEW` / `DONE`만 허용합니다. 제목 200자, URL 1,000자, 내용 10,000자 제한입니다. 제목·URL·상태는 필수이고 내용은 선택입니다.

YouTube `watch?v=`, `youtu.be`, `shorts`, `live`, `embed` 주소를 허용하고 11자리 영상 ID를 검사합니다. 저장 시 `https://www.youtube.com/watch?v=영상ID`로 정규화하며 추가 재생 시간·추적 파라미터는 제거합니다. 영상 존재 여부·비공개 여부는 YouTube API로 확인하지 않습니다. 외부 이동에 `noopener noreferrer`를 적용합니다.

응답 날짜는 UTC 기준 `LocalDateTime`이며 프런트엔드는 UTC로 해석해 브라우저 현지 날짜로 표시합니다. 오류는 일반적으로 `{ "message": "한글 설명" }` 형식이며 보안 필터에서 차단된 401/403은 본문이 없을 수 있습니다. 프런트엔드는 해당 상태에 대한 기본 안내를 제공합니다.

## 7. 인증 흐름

1. MyBatis로 계정을 읽고 BCrypt로 비밀번호를 확인합니다.
2. Access Token은 15분 유효한 JWT로 발급합니다. Zustand 메모리에만 보관하며 Local/Session Storage에 쓰지 않습니다.
3. Refresh Token은 암호학적 난수이며 Redis에는 SHA-256 해시 키와 사용자명만 7일 저장합니다. 원문은 HttpOnly 쿠키에만 보관합니다.
4. 페이지를 새로 열면 Refresh Cookie로 메모리 로그인 상태를 복원합니다.
5. 인증 API 외 요청에서 401이 발생하면 갱신을 한 번 수행하고 원래 요청을 재시도합니다. 동일 탭의 갱신 요청은 단일 Promise로 합칩니다.
6. 토큰 회전 시 Redis `GETDEL`로 기존 토큰을 한 번만 소비합니다. 다른 탭이 동시에 갱신하면 한 탭은 재로그인이 필요할 수 있습니다.
7. 로그아웃하면 Redis Refresh Token과 브라우저 쿠키·메모리 토큰을 제거합니다. 이미 탈취된 Access Token은 최대 15분 동안 유효할 수 있습니다. 서버 측 Access Token 차단 목록은 구현하지 않았습니다.

## 8. DB 구조와 마이그레이션

- `WLC_USERS`: ID(identity), USERNAME(unique), PASSWORD_HASH.
- `WLC_POSTS`: ID(identity), TITLE, VIDEO_URL, CONTENT(CLOB), STATUS, AUTHOR, CREATED_AT, UPDATED_AT, VERSION.
- `WLC_POST_STATUS_CK`: 신규/완료 값 제한.
- `WLC_POST_CREATED_IDX`: 생성일/ID 기준 최신 순 조회용 인덱스.
- `WLC_FLYWAY_HISTORY`: 적용 이력. 이미 적용한 SQL은 수정하지 않고 `V2__...sql`을 추가합니다.

Oracle 18c를 위해 Hibernate community의 `OracleLegacyDialect`를 사용합니다. 자동 테이블 변경은 끄고 `ddl-auto: validate`로 마이그레이션 결과를 검증합니다. DB 자체 문자 집합은 한글 저장을 위해 AL32UTF8을 권장합니다. 애플리케이션 UTF-8 설정은 DB 문자 집합을 변경하지 않습니다.

## 9. 테스트·빌드

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd package
```

백엔드 자동 테스트는 H2 Oracle 호환 모드에서 실제 Flyway SQL, JPA/Querydsl 목록·CRUD, MyBatis 로그인, 기본 계정 해시, 익명 쓰기 차단, 입력 검증, 동시 수정 충돌을 검증합니다. 인증 Redis 경계는 mock으로 대체하며 토큰 서비스 단위 테스트가 원자적 소비와 해시 저장 호출을 검사합니다. H2 테스트는 실제 Oracle 및 Redis 통합 테스트를 대체하지 않습니다.

H2의 `NUMBER(19)`와 Hibernate H2 dialect의 `BIGINT` 타입 차이로 테스트에서만 `ddl-auto=none`을 사용합니다. 실제 Oracle 실행은 `validate`를 유지하며 정상 기동을 확인했습니다.

```powershell
cd frontend
npm test
npm run build
```

URL 허용·거부 테스트와 TypeScript 검사, Vite 프로덕션 번들 빌드를 수행합니다.

Oracle·Redis·백엔드가 실행된 상태에서 실제 API 연동 검증은 프로젝트 루트에서 실행합니다.

```powershell
node scripts/smoke-test.mjs
```

이 스크립트는 기본 계정으로 로그인하고 임시 게시물 하나를 생성하여 한글 CRUD·수정 충돌·토큰 회전·로그아웃을 검증한 뒤 **직접 생성한 게시물만 삭제**합니다. `SMOKE_BASE_URL`, `SMOKE_USERNAME`, `SMOKE_PASSWORD` 환경 변수로 대상을 지정할 수 있습니다. Node.js `fetch`로 UTF-8 JSON을 처리합니다. Windows PowerShell 5의 `Invoke-RestMethod`는 charset 없는 JSON을 잘못 디코딩할 수 있으므로 한글 확인에는 이 스크립트를 사용합니다.

수동 확인 순서:

1. 비로그인 첫 화면에 전체 목록/빈 상태가 나타나는지 확인.
2. 잘못된 비밀번호가 거부되고 `stk1`로 로그인되는지 확인.
3. 한글 제목·내용으로 신규 등록 → 새로고침 후 유지 확인.
4. 영상 보기 링크가 새 탭으로 열리는지 확인.
5. 제목·URL·내용 수정 및 완료 변경 → 필터와 건수 확인.
6. 다른 창에서 동일 게시물을 수정한 뒤 오래된 버전 저장 시 충돌 확인.
7. 삭제 취소/승인, 로그인 새로고침 복원, 로그아웃 후 쓰기 차단 확인.

## 10. 배포 및 문제 해결

프런트엔드 `dist/`를 정적 웹 서버에 배포하고 `/api`를 백엔드로 프록시합니다. React Router를 위해 `/login` 등 정적 파일이 아닌 경로는 `index.html`로 fallback합니다. HTTPS와 `COOKIE_SECURE=true`, 배포 주소에 맞는 `ALLOWED_ORIGIN`을 설정합니다. 백엔드 JAR은 `backend`에서 `java -jar target/watchlater-0.0.1-SNAPSHOT.jar`로 실행하거나 환경 변수를 주입합니다.

- DB 연결 실패: 서버 IP·1521 포트·방화벽·서비스명 XEPDB1·계정 잠금 확인.
- ORA-01031/ORA-01950: 테이블 생성 권한 및 테이블스페이스 quota 확인.
- Redis 오류/로그인 503: `docker compose ps`, Redis 주소·암호 확인.
- 로그인 403: `localhost`/`127.0.0.1` 혼용 여부, `ALLOWED_ORIGIN` 확인.
- JWT 시작 오류: 비밀키 존재와 최소 길이 확인.
- 기존 계정 암호 불일치: 시드가 기존 암호를 덮어쓰지 않는 설계임을 확인.
- 썸네일/폰트 미표시: `i.ytimg.com`, Google Fonts 네트워크 접근 확인. 시스템 글꼴로 대체되며 CRUD와 링크는 독립적으로 동작합니다.
- 많은 게시물: 요청대로 페이징을 적용하지 않았으므로 목록 전체를 메모리로 읽습니다. 데이터가 커지면 서버 검색·페이징 도입이 필요합니다.

## 11. 개발 검증 결과

2026-10-08 개발 환경에서 확인한 결과입니다.

| 검증 | 결과 |
|---|---|
| 백엔드 `mvnw.cmd package` | 성공, 실행 가능한 JAR 생성 |
| 백엔드 자동 테스트 | 14개 통과, 실패 0 |
| 프런트엔드 `npm test` | 11개 통과 |
| 프런트엔드 `npm run build` | TypeScript 검사 및 Vite 빌드 성공 |
| 실제 Oracle 18c | 접속, Flyway 마이그레이션, Hibernate 스키마 검증, 한글 저장·조회 성공 |
| 실제 Redis | 로그인 발급, 갱신 토큰 회전, 이전 토큰 재사용 차단, 로그아웃 검증 성공 |
| 실제 게시물 API | 등록·조회·수정·삭제, 오래된 버전 409, 익명 삭제 401 확인 |
| 브라우저 수동/시각 검증 | 자동화 도구에 연결된 브라우저가 없어 미실행 |

기존 스키마에 `WL_USERS`, `WL_USER`, `WL_VIDEOS`, `WL_VIDEO` 등이 있어 이번 앱은 `WLC_USERS`, `WLC_POSTS`, `WLC_FLYWAY_HISTORY`로 분리했습니다. 최초 충돌 시 이번 실행에서 생성한 `WL_FLYWAY_HISTORY`만 정리했고 기존 사용자 테이블 및 데이터는 변경하지 않았습니다. 연동 테스트 게시물은 모두 정리했으므로 첫 화면은 빈 목록으로 시작합니다.

프런트엔드 빌드에는 AG Grid와 Ant Design을 포함한 단일 JS 번들 크기 경고(약 1.99 MB, gzip 약 605 KB)가 있습니다. 빌드는 성공했으며 배포 성능 개선 시 화면 및 라이브러리 분할을 적용할 수 있습니다.
