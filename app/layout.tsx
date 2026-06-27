// 根布局
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SYSTEM_CONFIG, DOMAINS } from '@/lib/config'

export const metadata: Metadata = {
  title: `${SYSTEM_CONFIG.productName} - AI 智能测评`,
  description: '专业企业增长分析，AI 智能诊断，发现企业增长潜力，提供定制化发展建议',
  keywords: '企业测评, AI分析, 增长诊断, 企业咨询, 并购',
  authors: [{ name: SYSTEM_CONFIG.companyName }],
  openGraph: {
    title: `${SYSTEM_CONFIG.productName} - AI 智能测评`,
    description: '专业企业增长分析，AI 智能诊断，发现企业增长潜力',
    type: 'website',
    url: DOMAINS.h5,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen max-w-md mx-auto bg-white shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  )
}
