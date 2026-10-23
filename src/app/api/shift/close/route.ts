import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actualCash, notes = '' } = body;

    const numActualCash = Number(actualCash);
    if (isNaN(numActualCash) || numActualCash < 0) {
      return NextResponse.json(
        { error: 'Jumlah uang fisik di laci tidak valid' },
        { status: 400 }
      );
    }

    const activeShift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      include: {
        pettyCashRecord: true,
        orders: true,
      },
    });

    if (!activeShift) {
      return NextResponse.json(
        { error: 'Tidak ada shift kasir yang sedang aktif' },
        { status: 400 }
      );
    }

    const cashDifference = numActualCash - activeShift.expectedCash;

    const closedShift = await prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        endTime: new Date(),
        actualCash: numActualCash,
        cashDifference,
        status: 'CLOSED',
        notes: notes ? `${activeShift.notes || ''} | ${notes}` : activeShift.notes,
      },
      include: {
        pettyCashRecord: true,
        orders: true,
      },
    });

    // Notify OWNER via WhatsApp
    try {
      const owner = await prisma.user.findFirst({ where: { role: 'OWNER', active: true, phone: { not: null } } });
      if (owner && owner.phone) {
        const selisihStr = cashDifference >= 0 ? `+Rp ${cashDifference.toLocaleString('id-ID')}` : `-Rp ${Math.abs(cashDifference).toLocaleString('id-ID')}`;
        const message = `[BrewPoint POS]\n\n🔔 *Laporan Tutup Kasir*\n\nKasir: ${activeShift.userName}\nWaktu Tutup: ${new Date().toLocaleTimeString('id-ID')}\n\nEkspektasi Uang: Rp ${activeShift.expectedCash.toLocaleString('id-ID')}\nUang Aktual (Dihitung): Rp ${numActualCash.toLocaleString('id-ID')}\nSelisih Laci: ${selisihStr}\n\nTotal Penjualan Tunai: Rp ${activeShift.totalCashSales.toLocaleString('id-ID')}\nTotal Qris: Rp ${activeShift.totalQrisSales.toLocaleString('id-ID')}`;
        
        await fetch('http://localhost:3001/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: owner.phone, message })
        });
      }
    } catch (waError) {
      console.error('Failed to send WA notification for shift close', waError);
    }

    return NextResponse.json({
      message: 'Shift kasir berhasil ditutup',
      shift: closedShift,
    });
  } catch (error) {
    console.error('Error closing shift:', error);
    return NextResponse.json(
      { error: 'Gagal menutup shift kasir' },
      { status: 500 }
    );
  }
}
