import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function UserCenterPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-2xl font-semibold">用户中心</h1>
        <p className="mt-2 text-sm text-slate-500">欢迎你，{session.user.name ?? session.user.email}</p>
      </div>
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">我的订单</h2>
          <Link href="/orders" className="text-sm text-brand">进入订单管理</Link>
        </div>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border p-3 text-sm">
              <p>订单号：{o.id}</p>
              <p>状态：{o.status}</p>
              <p>金额：¥ {o.totalAmount.toFixed(2)}</p>
              <p>商品：{o.items.map((i) => i.product.title).join('、')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
