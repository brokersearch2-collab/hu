import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== 'ADMIN') {
    return <div className="card">仅管理员可访问后台。</div>;
  }

  const [users, products, orders, categories, articles, settings, pendingProducts] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.article.count(),
    prisma.siteSetting.count(),
    prisma.product.findMany({ where: { status: 'PENDING' }, include: { merchant: true }, take: 10 })
  ]);

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-2xl font-semibold">后台首页</h1>
        <p className="mt-2 text-sm text-slate-500">管理用户、商品、订单、分类、文章、网站设置</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">用户：{users}</div>
        <div className="card">商品：{products}</div>
        <div className="card">订单：{orders}</div>
        <div className="card">分类：{categories}</div>
        <div className="card">文章：{articles}</div>
        <div className="card">网站设置：{settings}</div>
      </div>
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">待审核商品</h2>
        {pendingProducts.map((p) => (
          <div key={p.id} className="mb-2 rounded-lg border p-3 text-sm">
            <p>{p.title}</p>
            <p className="text-slate-500">商家：{p.merchant.nickname}</p>
            <p className="text-slate-500">状态：{p.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
