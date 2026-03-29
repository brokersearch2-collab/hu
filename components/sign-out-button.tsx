'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
      onClick={() => signOut({ callbackUrl: '/' })}
      type="button"
    >
      退出
    </button>
  );
}
