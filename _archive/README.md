# 보관 폴더 (데모 버전에서 제외된 기능)

노선도 · 열차 애니메이션 · 목록 보기 · 방명록 화면 · 종착 화면의 코드입니다.
Next.js는 이 폴더를 빌드에 포함하지 않으므로 화면에 나오지 않습니다.

되살리려면:
1. 이 폴더의 `.jsx` 파일을 `components/`로 되돌립니다 (`git mv _archive/*.jsx components/`).
2. `components/PortfolioApp.jsx`에서 데모 종료 화면 대신 `Ride`를 렌더링하도록 되돌립니다
   (`git log`에서 "데모 버전" 커밋 이전 파일을 참고하세요).
