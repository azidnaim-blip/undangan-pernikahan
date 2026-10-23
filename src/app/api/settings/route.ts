import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'default',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Owner yang dapat mengubah pengaturan toko' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Whitelist editable fields
    const { storeName, storeAddress, storePhone, receiptFooter, printerPaperSize } = body;
    const updateData: any = {};
    if (storeName !== undefined) updateData.storeName = storeName;
    if (storeAddress !== undefined) updateData.storeAddress = storeAddress;
    if (storePhone !== undefined) updateData.storePhone = storePhone;
    if (receiptFooter !== undefined) updateData.receiptFooter = receiptFooter;
    if (printerPaperSize !== undefined) updateData.printerPaperSize = printerPaperSize;

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    return NextResponse.json({ message: 'Pengaturan berhasil disimpan', settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}
