import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CreateOrderForm } from '@/components/create-order-form';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, merchant: true }
  });

  if (!product || product.status !== 'APPROVED') return notFound();

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p className="mt-2 text-slate-600">{product.summary}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
          <span>分类：{product.category.name}</span>
          <span>商家：{product.merchant.nickname}</span>
          <span>库存：{product.stock}</span>
        </div>
        <p className="mt-4 text-2xl font-bold text-brand">¥ {product.price.toFixed(2)}</p>
      </div>
      <CreateOrderForm productId={product.id} />
    </div>
  );
}
