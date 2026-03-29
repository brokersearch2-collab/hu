import Link from 'next/link';
import { auth } from '@/lib/auth';
import { SignOutButton } from './sign-out-button';

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-main flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-brand">
          互站MVP
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/products">商品</Link>
          <Link href="/merchant">商家中心</Link>
          <Link href="/user">用户中心</Link>
          <Link href="/admin">后台</Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span>{session.user.name ?? session.user.email}</span>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/login" className="rounded-lg bg-brand px-3 py-1.5 text-white">
              登录 / 注册
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
