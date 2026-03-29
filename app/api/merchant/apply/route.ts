import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: '请先登录' }, { status: 401 });

  const body = await req.json();

  await prisma.merchantProfile.upsert({
    where: { userId: session.user.id },
    update: {
      companyName: body.companyName,
      contactName: body.contactName,
      contactMobile: body.contactMobile,
      description: body.description,
      status: 'PENDING',
      rejectReason: null
    },
    create: {
      userId: session.user.id,
      companyName: body.companyName,
      contactName: body.contactName,
      contactMobile: body.contactMobile,
      description: body.description,
      status: 'PENDING'
    }
  });

  return NextResponse.json({ message: '申请已提交，等待管理员审核' });
}
