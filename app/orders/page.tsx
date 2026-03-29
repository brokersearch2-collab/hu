import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function OrderManagePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [buyOrders, sellOrders] = await Promise.all([
    prisma.order.findMany({ where: { buyerId: session.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({
      where: { items: { some: { product: { merchantId: session.user.id } } } },
      include: { items: { include: { product: true } }, buyer: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">买家订单</h2>
        {buyOrders.map((o) => (
          <p key={o.id} className="text-sm">{o.id} - {o.status} - ¥{o.totalAmount.toFixed(2)}</p>
        ))}
      </div>
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">卖家订单</h2>
        {sellOrders.map((o) => (
          <p key={o.id} className="text-sm">{o.id} - 买家:{o.buyer.nickname} - {o.status}</p>
        ))}
      </div>
    </div>
  );
}
