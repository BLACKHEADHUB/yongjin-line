import './globals.css';

export const metadata = {
  title: '용진선 노선도 | 포트폴리오',
  description: '사진영상에서 정보보호로 환승한 학생의 노선도형 포트폴리오',
  openGraph: { title: '용진선 노선도', description: '사진영상에서 정보보호로 환승한 학생의 노선도형 포트폴리오', type: 'website', locale: 'ko_KR' },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
