import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { QueryProvider } from '@/lib/providers/query-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trend Taster - 지금 뜨는 신상 제품',
  description: '편의점과 인기 외식 브랜드의 최신 제품을 탐색하고 공유하세요',
  generator: 'v0.app',
  keywords: ['편의점', '신제품', 'CU', 'GS25', '7-Eleven', 'Emart24', '버거킹', '맘스터치', '롯데리아', '엽떡', 'Trend Taster'],
  authors: [{ name: 'Trend Taster' }],
  openGraph: {
    title: 'Trend Taster - 지금 뜨는 신상 제품',
    description: '편의점과 인기 외식 브랜드의 최신 제품을 탐색하고 공유하세요',
    type: 'website',
    locale: 'ko_KR',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
