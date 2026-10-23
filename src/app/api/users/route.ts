import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const users = await prisma.user.findMany({
      where: all ? {} : { active: true },
      select: {
        id: true,
        name: true,
        role: true,
        phone: true,
        active: true,
        // Jangan kirim PIN ke client untuk security
      },
      orderBy: { role: 'desc' },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Owner yang dapat menambah karyawan' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, role, pin, phone } = body;

    const user = await prisma.user.create({
      data: {
        name,
        role,
        pin,
        phone,
        active: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Owner yang dapat mengubah status staf' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, active } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update user' }, { status: 500 });
  }
}
