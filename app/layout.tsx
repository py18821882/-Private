import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SYSTEM_CONFIG, DOMAINS } from '@/lib/config'

export const metadata: Metadata = {
  title: `${SYSTEM_CONFIG.productName} - 企业资本合作初步评估`,
  description: '中科商业咨询企业发展需求登记，用于并购、融资、股权出售、上市公司资源对接初步评估。',
  keywords: '中科商业咨询, 初步评估, 并购, 融资, 股权出售, 上市公司并购',
  authors: [{ name: SYSTEM_CONFIG.companyName }],
  openGraph: {
    title: `${SYSTEM_CONFIG.productName} - 企业资本合作初步评估`,
    description: '并购、融资、股权出售、上市公司资源对接初步评估。',
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
        <div
          className="min-h-screen w-full mx-auto overflow-x-hidden bg-white shadow-2xl"
          style={{ maxWidth: 'min(100vw, 28rem)' }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}

