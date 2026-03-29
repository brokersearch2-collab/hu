import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: 'APPROVED' },
    include: { category: true, merchant: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 });
  }

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      title: body.title,
      summary: body.summary,
      description: body.description,
      price: Number(body.price),
      stock: Number(body.stock ?? 100),
      categoryId: body.categoryId,
      merchantId: session.user.id,
      status: 'PENDING'
    }
  });

  return NextResponse.json(product, { status: 201 });
}
