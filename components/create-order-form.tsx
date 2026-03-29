'use client';

import { useState } from 'react';

export function CreateOrderForm({ productId }: { productId: string }) {
  const [message, setMessage] = useState('');

  const createOrder = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    const data = await res.json();
    setMessage(res.ok ? `下单成功，订单号：${data.id}` : data.message ?? '下单失败');
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold">立即购买</h3>
      <button className="mt-4 rounded-lg bg-brand px-4 py-2 text-white" onClick={createOrder} type="button">
        提交订单
      </button>
      {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
    </div>
  );
}
