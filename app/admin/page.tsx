import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MerchantStatus, OrderStatus, ProductStatus, UserRole } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const productStatuses = [ProductStatus.DRAFT, ProductStatus.PENDING, ProductStatus.APPROVED, ProductStatus.REJECTED] as const;
const merchantStatuses = [MerchantStatus.PENDING, MerchantStatus.APPROVED, MerchantStatus.REJECTED] as const;
const orderStatuses = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED
] as const;
const userRoles = [UserRole.USER, UserRole.MERCHANT, UserRole.ADMIN] as const;

const productStatusText: Record<ProductStatus, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回'
};
const merchantStatusText: Record<MerchantStatus, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回'
};
const orderStatusText: Record<OrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  DELIVERED: '已交付',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款'
};
const userRoleText: Record<UserRole, string> = {
  USER: '普通用户',
  MERCHANT: '商家',
  ADMIN: '管理员'
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== 'ADMIN') redirect('/admin/login');
  return user;
}

async function submitProductAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const action = String(formData.get('action') || '');
  const id = String(formData.get('id') || '');
  if (!id) return;

  if (action === 'delete') {
    await prisma.product.delete({ where: { id } });
  } else {
    const status = String(formData.get('status') || 'PENDING') as ProductStatus;
    const title = String(formData.get('title') || '');
    const summary = String(formData.get('summary') || '');
    const price = Number(formData.get('price') || 0);
    const stock = Number(formData.get('stock') || 0);
    const rejectReason = String(formData.get('rejectReason') || '');

    await prisma.product.update({
      where: { id },
      data: {
        title,
        summary,
        price,
        stock,
        status,
        description: String(formData.get('description') || ''),
        ...(status === 'REJECTED' ? { summary: rejectReason ? `${summary}（驳回原因：${rejectReason}）` : summary } : {})
      }
    });
  }
  revalidatePath('/admin');
}

async function submitCategoryAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const action = String(formData.get('action') || '');
  const id = String(formData.get('id') || '');

  if (action === 'create') {
    const name = String(formData.get('name') || '').trim();
    if (!name) return;
    const slug = String(formData.get('slug') || '').trim();
    await prisma.category.create({
      data: {
        name,
        slug,
        sortOrder: Number(formData.get('sortOrder') || 0),
        parentId: String(formData.get('parentId') || '') || null,
        isEnabled: String(formData.get('isEnabled') || 'true') === 'true'
      }
    });
  } else if (action === 'delete' && id) {
    await prisma.category.delete({ where: { id } });
  } else if (id) {
    await prisma.category.update({
      where: { id },
      data: {
        name: String(formData.get('name') || ''),
        slug: String(formData.get('slug') || ''),
        sortOrder: Number(formData.get('sortOrder') || 0),
        parentId: String(formData.get('parentId') || '') || null,
        isEnabled: String(formData.get('isEnabled') || 'true') === 'true'
      }
    });
  }
  revalidatePath('/admin');
}

async function submitUserAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const action = String(formData.get('action') || '');
  const id = String(formData.get('id') || '');
  if (!id) return;

  if (action === 'delete') {
    await prisma.user.delete({ where: { id } });
  } else {
    await prisma.user.update({
      where: { id },
      data: {
        nickname: String(formData.get('nickname') || ''),
        role: String(formData.get('role') || 'USER') as UserRole
      }
    });
  }
  revalidatePath('/admin');
}

async function submitMerchantAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const action = String(formData.get('action') || '');
  const id = String(formData.get('id') || '');
  if (!id) return;

  if (action === 'delete') {
    await prisma.merchantProfile.delete({ where: { id } });
  } else {
    await prisma.merchantProfile.update({
      where: { id },
      data: {
        companyName: String(formData.get('companyName') || ''),
        contactName: String(formData.get('contactName') || ''),
        contactMobile: String(formData.get('contactMobile') || ''),
        status: String(formData.get('status') || 'PENDING') as MerchantStatus,
        rejectReason: String(formData.get('rejectReason') || '') || null
      }
    });
  }
  revalidatePath('/admin');
}

async function submitOrderAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const action = String(formData.get('action') || '');
  const id = String(formData.get('id') || '');
  if (!id) return;

  if (action === 'delete') {
    await prisma.order.delete({ where: { id } });
  } else {
    await prisma.order.update({
      where: { id },
      data: {
        status: String(formData.get('status') || 'PENDING') as OrderStatus,
        remark: String(formData.get('remark') || '') || null
      }
    });
  }
  revalidatePath('/admin');
}

async function submitArticleAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const action = String(formData.get('action') || '');
  const id = String(formData.get('id') || '');

  if (action === 'create') {
    await prisma.article.create({
      data: {
        title: String(formData.get('title') || ''),
        slug: String(formData.get('slug') || ''),
        content: String(formData.get('content') || ''),
        isPublished: String(formData.get('isPublished') || 'false') === 'true'
      }
    });
  } else if (action === 'delete' && id) {
    await prisma.article.delete({ where: { id } });
  } else if (id) {
    await prisma.article.update({
      where: { id },
      data: {
        title: String(formData.get('title') || ''),
        slug: String(formData.get('slug') || ''),
        content: String(formData.get('content') || ''),
        isPublished: String(formData.get('isPublished') || 'false') === 'true'
      }
    });
  }
  revalidatePath('/admin');
}

async function submitSettingAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const action = String(formData.get('action') || '');
  const id = String(formData.get('id') || '');

  if (action === 'create') {
    await prisma.siteSetting.create({
      data: {
        settingKey: String(formData.get('settingKey') || ''),
        settingName: String(formData.get('settingName') || ''),
        settingValue: String(formData.get('settingValue') || '')
      }
    });
  } else if (action === 'delete' && id) {
    await prisma.siteSetting.delete({ where: { id } });
  } else if (id) {
    await prisma.siteSetting.update({
      where: { id },
      data: {
        settingKey: String(formData.get('settingKey') || ''),
        settingName: String(formData.get('settingName') || ''),
        settingValue: String(formData.get('settingValue') || '')
      }
    });
  }
  revalidatePath('/admin');
}

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams?: {
    productStatus?: ProductStatus;
    merchantStatus?: MerchantStatus;
    userRole?: UserRole;
    orderStatus?: OrderStatus;
    keyword?: string;
  };
}) {
  await requireAdmin();

  const keyword = searchParams?.keyword?.trim() || '';

  const [stats, categories, users, merchants, products, orders, articles, settings] = await Promise.all([
    Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.merchantProfile.count(),
      prisma.article.count(),
      prisma.siteSetting.count()
    ]),
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
    prisma.user.findMany({
      where: {
        role: searchParams?.userRole,
        ...(keyword
          ? {
              OR: [{ nickname: { contains: keyword } }, { email: { contains: keyword } }]
            }
          : {})
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.merchantProfile.findMany({
      where: {
        status: searchParams?.merchantStatus,
        ...(keyword ? { OR: [{ companyName: { contains: keyword } }, { contactName: { contains: keyword } }] } : {})
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      where: {
        status: searchParams?.productStatus,
        ...(keyword ? { title: { contains: keyword } } : {})
      },
      include: { merchant: true, category: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.findMany({
      where: {
        status: searchParams?.orderStatus,
        ...(keyword
          ? {
              OR: [{ buyer: { nickname: { contains: keyword } } }, { seller: { nickname: { contains: keyword } } }]
            }
          : {})
      },
      include: { buyer: true, seller: true, items: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.article.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.siteSetting.findMany({ orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">后台管理中心</h1>
            <p className="mt-2 text-sm text-slate-500">全站数据管理（Prisma + MySQL）</p>
          </div>
          <Link href="/" className="rounded-lg border px-3 py-1.5 text-sm">
            返回前台
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <div className="card">用户：{stats[0]}</div>
        <div className="card">商品：{stats[1]}</div>
        <div className="card">订单：{stats[2]}</div>
        <div className="card">商家：{stats[3]}</div>
        <div className="card">文章：{stats[4]}</div>
        <div className="card">设置：{stats[5]}</div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">统一筛选</h2>
        <form className="grid gap-3 md:grid-cols-5">
          <input className="rounded-lg border p-2" defaultValue={keyword} name="keyword" placeholder="关键词（用户/商品/商家）" />
          <select className="rounded-lg border p-2" defaultValue={searchParams?.productStatus || ''} name="productStatus">
            <option value="">全部商品状态</option>
            {productStatuses.map((item) => (
              <option key={item} value={item}>
                {productStatusText[item]}
              </option>
            ))}
          </select>
          <select className="rounded-lg border p-2" defaultValue={searchParams?.merchantStatus || ''} name="merchantStatus">
            <option value="">全部商家状态</option>
            {merchantStatuses.map((item) => (
              <option key={item} value={item}>
                {merchantStatusText[item]}
              </option>
            ))}
          </select>
          <select className="rounded-lg border p-2" defaultValue={searchParams?.userRole || ''} name="userRole">
            <option value="">全部用户角色</option>
            {userRoles.map((item) => (
              <option key={item} value={item}>
                {userRoleText[item]}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select className="w-full rounded-lg border p-2" defaultValue={searchParams?.orderStatus || ''} name="orderStatus">
              <option value="">全部订单状态</option>
              {orderStatuses.map((item) => (
                <option key={item} value={item}>
                  {orderStatusText[item]}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-brand px-4 text-white" type="submit">
              筛选
            </button>
          </div>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">1) 商品审核管理</h2>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>分类</th>
                <th>商家</th>
                <th>价格/库存</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="space-y-1">
                      <input className="w-full rounded border px-2 py-1" defaultValue={item.title} form={`product-${item.id}`} name="title" />
                      <input className="w-full rounded border px-2 py-1 text-xs" defaultValue={item.summary} form={`product-${item.id}`} name="summary" />
                    </div>
                  </td>
                  <td>{item.category.name}</td>
                  <td>{item.merchant.nickname}</td>
                  <td>
                    <div className="flex gap-2">
                      <input className="w-20 rounded border px-2 py-1" defaultValue={item.price.toString()} form={`product-${item.id}`} name="price" />
                      <input className="w-16 rounded border px-2 py-1" defaultValue={item.stock} form={`product-${item.id}`} name="stock" />
                    </div>
                  </td>
                  <td>
                    <select className="rounded border px-2 py-1" defaultValue={item.status} form={`product-${item.id}`} name="status">
                      {productStatuses.map((status) => (
                        <option key={status} value={status}>
                          {productStatusText[status]}
                        </option>
                      ))}
                    </select>
                    <input className="mt-1 w-full rounded border px-2 py-1 text-xs" form={`product-${item.id}`} name="rejectReason" placeholder="驳回原因（可选）" />
                    <input form={`product-${item.id}`} name="description" type="hidden" value={item.description} />
                  </td>
                  <td>
                    <form action={submitProductAction} className="flex gap-2" id={`product-${item.id}`}>
                      <input name="id" type="hidden" value={item.id} />
                      <button className="rounded bg-brand px-2 py-1 text-xs text-white" name="action" value="update">
                        保存
                      </button>
                      <button className="rounded bg-rose-500 px-2 py-1 text-xs text-white" name="action" value="delete">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">2) 分类管理</h2>
        <form action={submitCategoryAction} className="grid gap-2 rounded-lg border p-3 md:grid-cols-6">
          <input name="action" type="hidden" value="create" />
          <input className="rounded border p-2" name="name" placeholder="分类名称" required />
          <input className="rounded border p-2" name="slug" placeholder="分类标识（唯一）" required />
          <input className="rounded border p-2" name="sortOrder" placeholder="排序" type="number" defaultValue={0} />
          <select className="rounded border p-2" name="parentId">
            <option value="">无父级</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select className="rounded border p-2" name="isEnabled" defaultValue="true">
            <option value="true">启用</option>
            <option value="false">禁用</option>
          </select>
          <button className="rounded bg-brand px-4 py-2 text-white md:col-span-1" type="submit">
            新增分类
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>标识</th>
                <th>父级</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.name} form={`category-${item.id}`} name="name" />
                  </td>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.slug} form={`category-${item.id}`} name="slug" />
                  </td>
                  <td>
                    <select className="rounded border px-2 py-1" defaultValue={item.parentId || ''} form={`category-${item.id}`} name="parentId">
                      <option value="">无父级</option>
                      {categories
                        .filter((current) => current.id !== item.id)
                        .map((current) => (
                          <option key={current.id} value={current.id}>
                            {current.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <input className="w-20 rounded border px-2 py-1" defaultValue={item.sortOrder} form={`category-${item.id}`} name="sortOrder" type="number" />
                  </td>
                  <td>
                    <select className="rounded border px-2 py-1" defaultValue={String(item.isEnabled)} form={`category-${item.id}`} name="isEnabled">
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </td>
                  <td>
                    <form action={submitCategoryAction} className="flex gap-2" id={`category-${item.id}`}>
                      <input name="id" type="hidden" value={item.id} />
                      <button className="rounded bg-brand px-2 py-1 text-xs text-white" name="action" value="update">
                        保存
                      </button>
                      <button className="rounded bg-rose-500 px-2 py-1 text-xs text-white" name="action" value="delete">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">3) 用户管理</h2>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>昵称</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.nickname} form={`user-${item.id}`} name="nickname" />
                  </td>
                  <td>{item.email}</td>
                  <td>
                    <select className="rounded border px-2 py-1" defaultValue={item.role} form={`user-${item.id}`} name="role">
                      {userRoles.map((role) => (
                        <option key={role} value={role}>
                          {userRoleText[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{item.createdAt.toLocaleString('zh-CN')}</td>
                  <td>
                    <form action={submitUserAction} className="flex gap-2" id={`user-${item.id}`}>
                      <input name="id" type="hidden" value={item.id} />
                      <button className="rounded bg-brand px-2 py-1 text-xs text-white" name="action" value="update">
                        保存
                      </button>
                      <button className="rounded bg-rose-500 px-2 py-1 text-xs text-white" name="action" value="delete">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">4) 商家管理（含审核）</h2>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>用户</th>
                <th>公司名</th>
                <th>联系人</th>
                <th>状态</th>
                <th>驳回原因</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((item) => (
                <tr key={item.id}>
                  <td>{item.user.nickname}</td>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.companyName} form={`merchant-${item.id}`} name="companyName" />
                  </td>
                  <td>
                    <div className="space-y-1">
                      <input className="w-full rounded border px-2 py-1" defaultValue={item.contactName} form={`merchant-${item.id}`} name="contactName" />
                      <input className="w-full rounded border px-2 py-1" defaultValue={item.contactMobile} form={`merchant-${item.id}`} name="contactMobile" />
                    </div>
                  </td>
                  <td>
                    <select className="rounded border px-2 py-1" defaultValue={item.status} form={`merchant-${item.id}`} name="status">
                      {merchantStatuses.map((status) => (
                        <option key={status} value={status}>
                          {merchantStatusText[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.rejectReason || ''} form={`merchant-${item.id}`} name="rejectReason" />
                  </td>
                  <td>
                    <form action={submitMerchantAction} className="flex gap-2" id={`merchant-${item.id}`}>
                      <input name="id" type="hidden" value={item.id} />
                      <button className="rounded bg-brand px-2 py-1 text-xs text-white" name="action" value="update">
                        保存
                      </button>
                      <button className="rounded bg-rose-500 px-2 py-1 text-xs text-white" name="action" value="delete">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">5) 订单管理</h2>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>买家 / 卖家</th>
                <th>金额</th>
                <th>状态</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item) => (
                <tr key={item.id}>
                  <td className="text-xs">{item.id}</td>
                  <td>
                    <p>买家：{item.buyer.nickname}</p>
                    <p>卖家：{item.seller?.nickname || '系统'}</p>
                  </td>
                  <td>¥{item.totalAmount.toString()}</td>
                  <td>
                    <select className="rounded border px-2 py-1" defaultValue={item.status} form={`order-${item.id}`} name="status">
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {orderStatusText[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.remark || ''} form={`order-${item.id}`} name="remark" />
                  </td>
                  <td>
                    <form action={submitOrderAction} className="flex gap-2" id={`order-${item.id}`}>
                      <input name="id" type="hidden" value={item.id} />
                      <button className="rounded bg-brand px-2 py-1 text-xs text-white" name="action" value="update">
                        保存
                      </button>
                      <button className="rounded bg-rose-500 px-2 py-1 text-xs text-white" name="action" value="delete">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">6) 文章管理</h2>
        <form action={submitArticleAction} className="grid gap-2 rounded-lg border p-3 md:grid-cols-4">
          <input name="action" type="hidden" value="create" />
          <input className="rounded border p-2" name="title" placeholder="文章标题" required />
          <input className="rounded border p-2" name="slug" placeholder="文章 slug（唯一）" required />
          <select className="rounded border p-2" defaultValue="false" name="isPublished">
            <option value="false">草稿</option>
            <option value="true">发布</option>
          </select>
          <textarea className="min-h-20 rounded border p-2 md:col-span-3" name="content" placeholder="文章内容" required />
          <button className="rounded bg-brand px-4 py-2 text-white" type="submit">
            新增文章
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>标识</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.title} form={`article-${item.id}`} name="title" />
                  </td>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.slug} form={`article-${item.id}`} name="slug" />
                  </td>
                  <td>
                    <select className="rounded border px-2 py-1" defaultValue={String(item.isPublished)} form={`article-${item.id}`} name="isPublished">
                      <option value="false">草稿</option>
                      <option value="true">发布</option>
                    </select>
                  </td>
                  <td>
                    <form action={submitArticleAction} className="flex gap-2" id={`article-${item.id}`}>
                      <input name="id" type="hidden" value={item.id} />
                      <input name="content" type="hidden" value={item.content} />
                      <button className="rounded bg-brand px-2 py-1 text-xs text-white" name="action" value="update">
                        保存
                      </button>
                      <button className="rounded bg-rose-500 px-2 py-1 text-xs text-white" name="action" value="delete">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">7) 网站基础设置</h2>
        <form action={submitSettingAction} className="grid gap-2 rounded-lg border p-3 md:grid-cols-4">
          <input name="action" type="hidden" value="create" />
          <input className="rounded border p-2" name="settingName" placeholder="设置名称" required />
          <input className="rounded border p-2" name="settingKey" placeholder="设置键（唯一）" required />
          <input className="rounded border p-2" name="settingValue" placeholder="设置值" required />
          <button className="rounded bg-brand px-4 py-2 text-white" type="submit">
            新增设置
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>键</th>
                <th>值</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.settingName} form={`setting-${item.id}`} name="settingName" />
                  </td>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.settingKey} form={`setting-${item.id}`} name="settingKey" />
                  </td>
                  <td>
                    <input className="w-full rounded border px-2 py-1" defaultValue={item.settingValue} form={`setting-${item.id}`} name="settingValue" />
                  </td>
                  <td>
                    <form action={submitSettingAction} className="flex gap-2" id={`setting-${item.id}`}>
                      <input name="id" type="hidden" value={item.id} />
                      <button className="rounded bg-brand px-2 py-1 text-xs text-white" name="action" value="update">
                        保存
                      </button>
                      <button className="rounded bg-rose-500 px-2 py-1 text-xs text-white" name="action" value="delete">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
