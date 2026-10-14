# 최용진 포트폴리오 (용진선)

중부대학교 정보보호학과 최용진의 포트폴리오입니다. 첫 화면은 교통카드 모양의 신분증이고,
"노선도 탑승"을 누르면 개찰구를 지나 성장 과정을 지하철 노선도로 볼 수 있습니다.

- Next.js (App Router) / React
- 내용의 원본은 `data/portfolio.js` 파일 하나입니다.
- MongoDB Atlas를 연결하면 화면의 내용(프로필, 프로젝트, 역)을 DB에서 읽고 방명록이 켜집니다.
- DB가 없거나 실패해도 같은 내용이 파일에서 바로 보입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

## 내용 고치기

1. `data/portfolio.js`를 열어 `TODO` 표시된 곳을 고칩니다 (이름, 소개, 기술 스택, 프로젝트, 역 이야기).
2. 사진, 영상, 이력서 PDF는 `public/media/`에 넣고 `/media/파일이름`으로 적습니다. 유튜브는 주소를 그대로 적으면 됩니다.
3. 저장하면 로컬 화면에 바로 반영됩니다. 커밋하고 GitHub에 푸시하면 Vercel이 자동으로 다시 배포합니다.
4. DB가 연결돼 있으면 파일 내용이 바뀐 것을 서버가 알아채고 처음 읽을 때 DB에 자동으로 맞춰 넣습니다 (별도 명령이나 관리 화면 없음). 최대 1분 안에 화면에 반영됩니다.

## 배포 (Vercel)

1. vercel.com에서 이 저장소를 Import 하고 Deploy 합니다. 설정은 기본값 그대로 둡니다.
2. 이후에는 `main`에 푸시할 때마다 자동으로 배포됩니다.

## MongoDB 연결 (Atlas)

1. Atlas에서 무료(M0) 클러스터를 만들고, 이 DB에 `readWrite` 권한만 있는 사용자를 만듭니다.
2. Network Access에 `0.0.0.0/0`을 추가합니다 (Vercel 접속용). 대신 DB 비밀번호를 길게 만듭니다.
3. 연결 문자열을 로컬은 `.env.local`의 `MONGODB_URI`에, 배포는 Vercel의 Environment Variables에 넣고 Redeploy 합니다.
4. 별도 초기화(시드)는 필요 없습니다. 첫 접속 때 `profile`, `projects`, `stations`, `meta` 컬렉션이 자동으로 만들어지고, 방명록 컬렉션은 첫 글이 저장될 때 만들어집니다.

방명록 글 삭제는 Atlas 화면(Browse Collections → `guestbook`)에서 합니다.

## 구조

```
data/portfolio.js   사이트 내용 전부 (프로필, 기술 스택, 프로젝트, 역)
app/page.js         첫 화면 (DB에서 읽고 1분간 재사용)
lib/content.js      DB에서 내용 읽기 + 파일 내용과 자동 동기화 + 실패 시 파일로 대체
app/api/guestbook   방명록 API (MongoDB가 있을 때만 동작)
components/         Platform(신분증), Gate(개찰구), Ride, MapView(노선도), ListView, Guestbook, Ending
lib/layout.js       노선도 좌표 (역 좌표는 선 위에 있어야 합니다)
lib/mongodb.js      MongoDB 연결 (서버리스용 연결 재사용)
```

보안 설계는 [SECURITY.md](SECURITY.md)를 보세요.
