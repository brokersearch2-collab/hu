import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: '请先登录' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: '请先登录' }, { status: 401 });

  const body = await req.json();
  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product || product.status !== 'APPROVED') {
    return NextResponse.json({ message: '商品不可下单' }, { status: 400 });
  }

  const totalAmount = product.price * Number(body.quantity ?? 1);

  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      totalAmount,
      status: 'PENDING',
      items: {
        create: {
          productId: product.id,
          quantity: Number(body.quantity ?? 1),
          unitPrice: product.price
        }
      }
    }
  });

  return NextResponse.json(order, { status: 201 });
}
