import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PRODUCT_STATUS_TEXT } from '@/lib/constants';
import { MerchantProductForm } from '@/components/merchant-product-form';
import { MerchantApplyForm } from '@/components/merchant-apply-form';

export default async function MerchantCenterPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [merchantProfile, categories, products] = await Promise.all([
    prisma.merchantProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({ where: { merchantId: session.user.id }, include: { category: true }, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-2xl font-semibold">商家中心</h1>
        <p className="mt-2 text-sm text-slate-500">
          入驻状态：{merchantProfile ? merchantProfile.status : '未申请'}
        </p>
      </div>
      <MerchantApplyForm />
      <MerchantProductForm categories={categories} />
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">我的商品</h2>
        <div className="space-y-2 text-sm">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg border p-3">
              <p>{p.title}</p>
              <p className="text-slate-500">分类：{p.category.name} / 状态：{PRODUCT_STATUS_TEXT[p.status]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
