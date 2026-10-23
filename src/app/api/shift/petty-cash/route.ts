import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, reason } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Nominal kas keluar harus lebih dari 0' },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Keterangan pengeluaran harus diisi' },
        { status: 400 }
      );
    }

    const activeShift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeShift) {
      return NextResponse.json(
        { error: 'Tidak ada shift kasir yang aktif' },
        { status: 400 }
      );
    }

    const [pettyCash, updatedShift] = await prisma.$transaction([
      prisma.pettyCash.create({
        data: {
          shiftId: activeShift.id,
          amount: numAmount,
          reason: reason.trim(),
        },
      }),
      prisma.shift.update({
        where: { id: activeShift.id },
        data: {
          totalPettyCash: { increment: numAmount },
          expectedCash: { decrement: numAmount },
        },
      }),
    ]);

    return NextResponse.json({ pettyCash, shift: updatedShift }, { status: 201 });
  } catch (error) {
    console.error('Error recording petty cash:', error);
    return NextResponse.json(
      { error: 'Gagal mencatat kas keluar' },
      { status: 500 }
    );
  }
}
