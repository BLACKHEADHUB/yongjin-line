# 최용진 포트폴리오 (용진선)

중부대학교 정보보호학과 최용진의 포트폴리오입니다. 첫 화면은 교통카드 모양의 신분증이고,
"노선도 탑승"을 누르면 개찰구를 지나 성장 과정을 지하철 노선도로 볼 수 있습니다.

- Next.js (App Router) / React
- 내용은 `data/portfolio.js` 파일 하나에 있습니다. DB가 없어도 전부 동작합니다.
- MongoDB Atlas는 선택 사항이며, 연결하면 방명록이 켜집니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

## 내용 고치기

1. `data/portfolio.js`를 열어 `TODO` 표시된 곳을 고칩니다 (이름, 소개, 기술 스택, 프로젝트, 역 이야기).
2. 사진, 영상, 이력서 PDF는 `public/media/`에 넣고 `/media/파일이름`으로 적습니다. 유튜브는 주소를 그대로 적으면 됩니다.
3. 저장하면 로컬 화면에 바로 반영됩니다. 커밋하고 GitHub에 푸시하면 Vercel이 자동으로 다시 배포합니다.

## 배포 (Vercel)

1. vercel.com에서 이 저장소를 Import 하고 Deploy 합니다. 설정은 기본값 그대로 둡니다.
2. 이후에는 `main`에 푸시할 때마다 자동으로 배포됩니다.

## 방명록 켜기 (선택, MongoDB Atlas)

1. Atlas에서 무료(M0) 클러스터를 만들고, 이 DB에 `readWrite` 권한만 있는 사용자를 만듭니다.
2. Network Access에 `0.0.0.0/0`을 추가합니다 (Vercel 접속용). 대신 DB 비밀번호를 길게 만듭니다.
3. 연결 문자열을 로컬은 `.env.local`의 `MONGODB_URI`에, 배포는 Vercel의 Environment Variables에 넣고 Redeploy 합니다.
4. 별도 초기화(시드)는 필요 없습니다. 첫 글이 저장될 때 컬렉션이 자동으로 만들어집니다.

방명록 글 삭제는 Atlas 화면(Browse Collections → `guestbook`)에서 합니다.

## 구조

```
data/portfolio.js   사이트 내용 전부 (프로필, 기술 스택, 프로젝트, 역)
app/page.js         첫 화면 (정적 페이지)
app/api/guestbook   방명록 API (MongoDB가 있을 때만 동작)
components/         Platform(신분증), Gate(개찰구), Ride, MapView(노선도), ListView, Guestbook, Ending
lib/layout.js       노선도 좌표 (역 좌표는 선 위에 있어야 합니다)
lib/mongodb.js      MongoDB 연결 (서버리스용 연결 재사용)
```

보안 설계는 [SECURITY.md](SECURITY.md)를 보세요.
