'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const nickname = String(form.get('nickname') || '');

    if (isRegister) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname })
      });
      const data = await res.json();
      setMessage(data.message);
      return;
    }

    const result = await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
    if (result?.error) setMessage('登录失败，请检查账号密码');
  }

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="text-2xl font-semibold">{isRegister ? '用户注册' : '用户登录'}</h1>
      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        {isRegister && <input className="w-full rounded-lg border p-2" name="nickname" placeholder="昵称" required />}
        <input className="w-full rounded-lg border p-2" name="email" placeholder="邮箱" required type="email" />
        <input className="w-full rounded-lg border p-2" name="password" placeholder="密码" required type="password" />
        <button className="w-full rounded-lg bg-brand py-2 text-white" type="submit">
          {isRegister ? '注册' : '登录'}
        </button>
      </form>
      <button className="mt-3 text-sm text-brand" onClick={() => setIsRegister(!isRegister)} type="button">
        {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
      </button>
      {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
    </div>
  );
}
