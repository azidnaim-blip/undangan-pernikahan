import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, pin } = body;

    if (!id || !pin) {
      return NextResponse.json(
        { error: 'ID dan PIN wajib diisi' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (user.pin !== pin) {
      return NextResponse.json(
        { error: 'PIN yang Anda masukkan salah' },
        { status: 401 }
      );
    }

    // Return user without pin
    const { pin: _, ...safeUser } = user;
    
    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
