import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(6, '密码至少 6 位'),
  nickname: z.string().min(2, '昵称至少 2 位')
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? '参数错误' }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return NextResponse.json({ message: '邮箱已注册' }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      nickname: parsed.data.nickname,
      passwordHash
    }
  });

  return NextResponse.json({ message: '注册成功' });
}
