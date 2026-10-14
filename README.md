# 용진선 노선도 (포트폴리오)

사진영상에서 정보보호로 환승한 과정을 지하철 노선도로 보여 주는 포트폴리오입니다.
Next.js(App Router) + MongoDB Atlas로 만들었습니다.

- 첫 화면: 소개, 기술 스택(분야별), 프로젝트, 성장 과정, 연락처를 담은 일반 포트폴리오 페이지
- 성장 과정 섹션에서 "노선도로 보기"로 들어가면 개찰구를 지나 노선도(자유 탐색 / 자동 재생 / 목록 보기)가 열립니다
- 탑승객 방명록, 관리자 페이지(`/admin`)
- DB가 없거나 실패해도 `data/seed.mjs`의 기본 내용으로 사이트가 뜹니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값을 채웁니다 (아래 참고)
npm run dev                  # http://localhost:3000
npm run seed                 # DB에 기본 내용 넣기 (이미 있는 것은 건드리지 않음)
npm run seed -- --reset      # 기본 내용으로 되돌리기 (방명록은 유지)
```

`.env.local` (이 파일은 git에 올라가지 않습니다)

| 이름 | 설명 |
|---|---|
| `MONGODB_URI` | Atlas 연결 문자열 |
| `MONGODB_DB` | 데이터베이스 이름 (예: `yongjin`) |
| `ADMIN_PASSWORD` | 관리자 비밀번호 (길고 추측하기 어렵게) |
| `SESSION_SECRET` | 로그인 쿠키 서명용 임의 문자열 32자 이상 (`openssl rand -hex 32`) |

## MongoDB Atlas 준비 (무료 M0)

1. atlas 가입 후 Free(M0) 클러스터를 만듭니다.
2. Database Access에서 사용자를 만듭니다. 권한은 이 DB에 `readWrite`만 줍니다 (관리자 권한 금지).
3. Network Access에 Vercel이 접속할 수 있게 `0.0.0.0/0`을 추가합니다. 대신 DB 비밀번호를 길게 만드세요.
4. Connect → Drivers에서 연결 문자열을 복사해 `MONGODB_URI`에 넣습니다.
5. `npm run seed`로 기본 내용을 넣습니다.

무료 클러스터는 30일간 접속이 없으면 일시 정지됩니다. 발표 전에 한 번 접속해 두세요.

## Vercel 배포

1. 이 저장소를 GitHub에 올립니다 (이미 올라가 있다면 생략).
2. vercel.com에서 저장소를 Import 합니다. Framework는 Next.js로 자동 인식됩니다.
3. Settings → Environment Variables에 위 4개를 넣고 Deploy 합니다.
4. 배포된 주소에서 `/admin`으로 로그인해 내용을 고칩니다.

## 내용 채우기

- 코드에서: `data/seed.mjs`의 `TODO`로 표시된 곳 (이름, 학년, 이메일, 이야기 등)
- 화면에서: `/admin` (DB 연결 필요). 사진은 `public/` 폴더에 넣고 `/photo.jpg`처럼 적거나 https 주소를 씁니다. 유튜브는 주소만 붙여 넣으면 됩니다.
- 이력서 PDF: `public/resume.pdf`로 두고 프로필의 이력서 주소에 `/resume.pdf`

## 구조

```
app/            페이지와 API (api/guestbook, api/admin/*)
components/     화면 (Gate, Platform, Ride, MapView, ListView, Guestbook, Ending, AdminApp)
lib/            mongodb 연결, 시드, 검증(validate), 인증(auth), API 공통(api)
lib/layout.js   노선도 좌표 (역 좌표는 선 위에 있어야 합니다)
data/seed.mjs   기본 내용 (DB가 비었거나 실패했을 때도 이 내용이 보입니다)
scripts/seed.mjs
```

보안 설계는 [SECURITY.md](SECURITY.md)를 보세요.
