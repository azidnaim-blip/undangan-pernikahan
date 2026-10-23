import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const getAll = searchParams.get('all') === 'true';

    if (getAll) {
      const shifts = await prisma.shift.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          pettyCashRecord: true,
          orders: {
            select: { id: true, total: true, paymentMethod: true },
          },
        },
      });
      return NextResponse.json(shifts);
    }

    // Get current active shift
    const activeShift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      include: {
        pettyCashRecord: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    return NextResponse.json(activeShift);
  } catch (error) {
    console.error('Error fetching shift:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data shift' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName = 'Kasir', startingCash = 0, notes = '' } = body;

    // Check if there is already an open shift
    const existingShift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
    });

    if (existingShift) {
      return NextResponse.json(
        { error: 'Masih ada shift kasir yang sedang aktif', shift: existingShift },
        { status: 400 }
      );
    }

    const startAmount = Number(startingCash) || 0;

    const newShift = await prisma.shift.create({
      data: {
        userName,
        startingCash: startAmount,
        expectedCash: startAmount,
        totalCashSales: 0,
        totalQrisSales: 0,
        totalPettyCash: 0,
        status: 'OPEN',
        notes,
      },
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    console.error('Error opening shift:', error);
    return NextResponse.json(
      { error: 'Gagal membuka shift kasir' },
      { status: 500 }
    );
  }
}
