'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setMessage('登录失败，请检查账号密码');
      return;
    }

    const verify = await fetch('/api/admin/check-role');
    if (!verify.ok) {
      setMessage('当前账号不是管理员，无法进入后台');
      return;
    }

    window.location.href = '/admin';
  }

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="text-2xl font-semibold">管理员登录</h1>
      <p className="mt-2 text-sm text-slate-500">仅管理员可访问后台管理功能</p>
      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded-lg border p-2" name="email" placeholder="管理员邮箱" required type="email" />
        <input className="w-full rounded-lg border p-2" name="password" placeholder="管理员密码" required type="password" />
        <button className="w-full rounded-lg bg-brand py-2 text-white" type="submit">
          登录后台
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-rose-600">{message}</p>}
    </div>
  );
}
