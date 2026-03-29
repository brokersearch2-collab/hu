'use client';

import { useState } from 'react';

type Category = { id: string; name: string };

export function MerchantProductForm({ categories }: { categories: Category[] }) {
  const [message, setMessage] = useState('');

  async function submit(formData: FormData) {
    const payload = {
      title: String(formData.get('title') ?? ''),
      summary: String(formData.get('summary') ?? ''),
      description: String(formData.get('description') ?? ''),
      price: Number(formData.get('price') ?? 0),
      stock: Number(formData.get('stock') ?? 100),
      categoryId: String(formData.get('categoryId') ?? '')
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setMessage(res.ok ? `提交成功，商品ID：${data.id}` : data.message ?? '提交失败');
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">发布新商品（提交后进入待审核）</h2>
      <form className="mt-4 grid gap-3" action={submit}>
        <input className="rounded-lg border p-2" name="title" placeholder="商品标题" required />
        <input className="rounded-lg border p-2" name="summary" placeholder="商品摘要" required />
        <textarea className="rounded-lg border p-2" name="description" placeholder="商品详情" rows={4} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="rounded-lg border p-2" min={0} name="price" placeholder="价格" required step="0.01" type="number" />
          <input className="rounded-lg border p-2" min={0} name="stock" placeholder="库存" type="number" />
        </div>
        <select className="rounded-lg border p-2" name="categoryId" required>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="rounded-lg bg-brand py-2 text-white" type="submit">提交审核</button>
      </form>
      {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
    </div>
  );
}
