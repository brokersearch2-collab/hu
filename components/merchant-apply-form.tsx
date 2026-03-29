'use client';

import { useState } from 'react';

export function MerchantApplyForm() {
  const [message, setMessage] = useState('');

  async function submit(formData: FormData) {
    const payload = {
      companyName: String(formData.get('companyName') ?? ''),
      contactName: String(formData.get('contactName') ?? ''),
      contactMobile: String(formData.get('contactMobile') ?? ''),
      description: String(formData.get('description') ?? '')
    };

    const res = await fetch('/api/merchant/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setMessage(data.message ?? '操作完成');
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">商家入驻申请</h2>
      <form className="mt-4 grid gap-3" action={submit}>
        <input className="rounded-lg border p-2" name="companyName" placeholder="公司/品牌名称" required />
        <input className="rounded-lg border p-2" name="contactName" placeholder="联系人" required />
        <input className="rounded-lg border p-2" name="contactMobile" placeholder="手机号" required />
        <textarea className="rounded-lg border p-2" name="description" placeholder="主营服务介绍" rows={3} />
        <button className="rounded-lg border border-brand py-2 text-brand" type="submit">提交入驻申请</button>
      </form>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
