import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data kategori' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, icon, sortOrder } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }
    const cat = await prisma.category.create({
      data: { name, icon: icon || 'Coffee', sortOrder: sortOrder || 0 }
    });
    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat kategori' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, icon, sortOrder } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    
    const cat = await prisma.category.update({
      where: { id },
      data: { name, icon, sortOrder }
    });
    return NextResponse.json(cat);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengubah kategori' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    
    // Check if products exist in category
    const products = await prisma.product.count({ where: { categoryId: id } });
    if (products > 0) {
      return NextResponse.json({ error: 'Kategori ini masih memiliki produk terhubung' }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}
