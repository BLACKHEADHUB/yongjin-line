import './globals.css';

export const metadata = {
  title: '최용진 포트폴리오',
  description: '중부대학교 정보보호학과 최용진의 포트폴리오',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
