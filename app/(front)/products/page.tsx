import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function ProductListPage({
  searchParams
}: {
  searchParams: { keyword?: string; category?: string };
}) {
  const products = await prisma.product.findMany({
    where: {
      status: 'APPROVED',
      title: searchParams.keyword ? { contains: searchParams.keyword } : undefined,
      category: searchParams.category ? { slug: searchParams.category } : undefined
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-2xl font-semibold">商品列表</h1>
        <p className="text-sm text-slate-500">支持分类筛选和关键字搜索（通过 URL 参数）</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className="card">
            <p className="font-semibold">{p.title}</p>
            <p className="mt-2 text-sm text-slate-600">{p.summary}</p>
            <p className="mt-3 text-xs text-slate-500">分类：{p.category.name}</p>
            <p className="mt-2 text-lg font-bold text-brand">¥ {p.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
