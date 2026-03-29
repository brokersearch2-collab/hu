import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: '互站MVP - 虚拟商品与服务交易平台',
  description: '基于 Next.js 14 + Prisma + MySQL 的交易平台 MVP'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Navbar />
          <main className="container-main py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
