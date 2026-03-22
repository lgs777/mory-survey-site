import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mory | 한국 장례문화의 불편했던 점',
  description: '우리는 장례식에서 무엇이 불편했을까요? 당신의 이야기를 남겨주세요.',
  openGraph: {
    title: 'Mory | 한국 장례문화의 불편했던 점',
    description: '우리는 장례식에서 무엇이 불편했을까요? 당신의 이야기를 남겨주세요.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
