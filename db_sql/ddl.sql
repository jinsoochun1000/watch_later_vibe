-- ============================================================================
-- Script Name : TB_WATCHLATER_DDL.sql
-- Description : YouTube 나중에 볼 영상 메모 앱 테이블 및 시퀀스 생성 스크립트
-- DB Env      : Oracle Database (Host: 192.168.45.2, Port: 1521, PDB: XEPDB1)
-- Schema      : USERSTK6
-- Charset     : AL32UTF8 (CHAR 세맨틱 적용)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 객체 초기화 (기존 테이블 및 시퀀스 정리)
-- ----------------------------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TB_WATCHLATER CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TB_USER CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_TB_USER';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_TB_WATCHLATER';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/

-- ----------------------------------------------------------------------------
-- 2. 시퀀스(Sequence) 생성
-- ----------------------------------------------------------------------------
CREATE SEQUENCE SEQ_TB_USER
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE SEQ_TB_WATCHLATER
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- ----------------------------------------------------------------------------
-- 3. 작성자 마스터 테이블 (TB_USER)
-- ----------------------------------------------------------------------------
CREATE TABLE TB_USER (
    USER_ID         NUMBER              NOT NULL,
    LOGIN_ID        VARCHAR2(50 CHAR)   NOT NULL,
    USER_NM         VARCHAR2(50 CHAR)   NOT NULL,
    USER_PW         VARCHAR2(256 CHAR)  NOT NULL,
    EMAIL           VARCHAR2(100 CHAR),
    USE_YN          CHAR(1 CHAR)        DEFAULT 'Y' NOT NULL,
    REG_DT          DATE                DEFAULT SYSDATE NOT NULL,
    UPT_DT          DATE                DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_TB_USER PRIMARY KEY (USER_ID),
    CONSTRAINT UQ_TB_USER_LOGIN_ID UNIQUE (LOGIN_ID),
    CONSTRAINT CK_TB_USER_USE_YN CHECK (USE_YN IN ('Y', 'N'))
);

COMMENT ON TABLE  TB_USER          IS '사용자(작성자) 마스터 테이블';
COMMENT ON COLUMN TB_USER.USER_ID  IS '사용자 고유식별자 (PK, SEQ)';
COMMENT ON COLUMN TB_USER.LOGIN_ID IS '로그인 계정 ID (UNIQUE)';
COMMENT ON COLUMN TB_USER.USER_NM  IS '사용자명 / 닉네임';
COMMENT ON COLUMN TB_USER.USER_PW  IS '암호화된 비밀번호 해시';
COMMENT ON COLUMN TB_USER.EMAIL    IS '이메일 주소';
COMMENT ON COLUMN TB_USER.USE_YN   IS '계정 활성 여부 (Y/N)';
COMMENT ON COLUMN TB_USER.REG_DT   IS '계정 등록일시';
COMMENT ON COLUMN TB_USER.UPT_DT   IS '계정 정보 최종수정일시';

-- ----------------------------------------------------------------------------
-- 4. 나중에 볼 영상 메모 게시판 테이블 (TB_WATCHLATER)
-- ----------------------------------------------------------------------------
CREATE TABLE TB_WATCHLATER (
    POST_ID         NUMBER              NOT NULL,
    TITLE           VARCHAR2(200 CHAR)  NOT NULL,
    VIDEO_URL       VARCHAR2(500 CHAR)  NOT NULL,
    CONTENT         CLOB                NOT NULL,
    VIEW_CNT        NUMBER              DEFAULT 0 NOT NULL,
    REG_USER_ID     NUMBER              NOT NULL,
    WATCH_YN        CHAR(1 CHAR)        DEFAULT 'N' NOT NULL,
    DEL_YN          CHAR(1 CHAR)        DEFAULT 'N' NOT NULL,
    REG_DT          DATE                DEFAULT SYSDATE NOT NULL,
    UPT_DT          DATE                DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_TB_WATCHLATER PRIMARY KEY (POST_ID),
    CONSTRAINT FK_TB_WATCHLATER_USER FOREIGN KEY (REG_USER_ID) REFERENCES TB_USER(USER_ID),
    CONSTRAINT CK_TB_WATCHLATER_VIEW_CNT CHECK (VIEW_CNT >= 0),
    CONSTRAINT CK_TB_WATCHLATER_WATCH_YN CHECK (WATCH_YN IN ('Y', 'N')),
    CONSTRAINT CK_TB_WATCHLATER_DEL_YN CHECK (DEL_YN IN ('Y', 'N'))
);

COMMENT ON TABLE  TB_WATCHLATER             IS 'YouTube 나중에 볼 영상 메모 게시글 테이블';
COMMENT ON COLUMN TB_WATCHLATER.POST_ID     IS '게시글/메모 고유식별자 (PK, SEQ)';
COMMENT ON COLUMN TB_WATCHLATER.TITLE       IS '영상 제목 또는 메모 타이틀';
COMMENT ON COLUMN TB_WATCHLATER.VIDEO_URL   IS '유튜브 동영상 링크 URL';
COMMENT ON COLUMN TB_WATCHLATER.CONTENT     IS '나중에 볼 이유, 타임스탬프, 요약 메모 본문 (CLOB)';
COMMENT ON COLUMN TB_WATCHLATER.VIEW_CNT    IS '게시글/메모 조회수';
COMMENT ON COLUMN TB_WATCHLATER.REG_USER_ID IS '작성자 식별키 (FK: TB_USER.USER_ID)';
COMMENT ON COLUMN TB_WATCHLATER.WATCH_YN    IS '영상 시청 완료 여부 (Y/N)';
COMMENT ON COLUMN TB_WATCHLATER.DEL_YN      IS '논리 삭제 여부 플래그 (Y/N)';
COMMENT ON COLUMN TB_WATCHLATER.REG_DT      IS '게시글 등록일시';
COMMENT ON COLUMN TB_WATCHLATER.UPT_DT      IS '게시글 최종수정일시';

-- ----------------------------------------------------------------------------
-- 5. 인덱스(Index) 설계
-- ----------------------------------------------------------------------------
-- 목록 조회/페이징 최적화 인덱스 (삭제여부 + 최신등록순)
CREATE INDEX IX_TB_WATCHLATER_LIST ON TB_WATCHLATER (DEL_YN, REG_DT DESC);

-- 사용자별 마이리스트 조회 및 FK 참조 성능 인덱스
CREATE INDEX IX_TB_WATCHLATER_USER ON TB_WATCHLATER (REG_USER_ID, DEL_YN, WATCH_YN);

-- ----------------------------------------------------------------------------
-- 6. 초기 테스트 데이터 (DML)
-- ----------------------------------------------------------------------------
INSERT INTO TB_USER (USER_ID, LOGIN_ID, USER_NM, USER_PW, EMAIL)
VALUES (SEQ_TB_USER.NEXTVAL, 'ilcheon', '일천', 'hashed_pwd_1234', 'ilcheon@example.com');

INSERT INTO TB_WATCHLATER (
    POST_ID, TITLE, VIDEO_URL, CONTENT, VIEW_CNT, REG_USER_ID, WATCH_YN, DEL_YN
) VALUES (
    SEQ_TB_WATCHLATER.NEXTVAL,
    '오라클 19c 실행계획 튜닝 및 인덱스 스캔 원리 강의',
    'https://www.youtube.com/watch?v=sample_oracle_tuning',
    '인덱스 풀 스캔 vs 레인지 스캔 조건 분석 부분 (23:15) 주말에 재시청할 것.',
    0,
    1,
    'N',
    'N'
);

COMMIT;