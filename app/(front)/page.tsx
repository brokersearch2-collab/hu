import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'APPROVED' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    prisma.category.findMany({ take: 8, orderBy: { sortOrder: 'asc' } })
  ]);

  return (
    <div className="space-y-8">
      <section className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h1 className="text-3xl font-bold">虚拟商品与服务交易平台 MVP</h1>
        <p className="mt-3 text-blue-100">支持商家入驻、商品审核、用户下单、前后台一体化管理。</p>
        <div className="mt-6 flex gap-3">
          <Link className="rounded-lg bg-white px-4 py-2 text-blue-700" href="/products">
            浏览商品
          </Link>
          <Link className="rounded-lg border border-white/70 px-4 py-2" href="/merchant">
            申请入驻 / 商家中心
          </Link>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">热门分类</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="rounded-lg border border-slate-200 p-3 text-sm hover:border-brand hover:text-brand">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">最新上架</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="rounded-lg border border-slate-200 p-4 hover:border-brand">
              <p className="font-medium">{p.title}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.summary}</p>
              <p className="mt-3 text-sm text-slate-500">分类：{p.category.name}</p>
              <p className="mt-1 text-lg font-semibold text-brand">¥ {p.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
