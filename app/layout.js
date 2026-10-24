import './globals.css';

export const metadata = {
  title: '최용진 포트폴리오',
  description: '중부대학교 정보보호학과 최용진의 포트폴리오',
  openGraph: { title: '최용진 포트폴리오 · 용진선', description: '교통카드를 찍고 노선도를 따라 성장 과정을 만나 보세요.', type: 'website', locale: 'ko_KR' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1a7f4b' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
