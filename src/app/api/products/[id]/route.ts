import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, price, description, image, categoryId, isAvailable } = body;

    const dataToUpdate: Record<string, unknown> = {};

    if (name !== undefined) dataToUpdate.name = name.trim();
    if (price !== undefined) dataToUpdate.price = Number(price);
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
    if (image !== undefined) dataToUpdate.image = image;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui menu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    // Try hard delete or soft delete
    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch {
      // If referenced by order items with constraints, soft delete
      await prisma.product.update({
        where: { id },
        data: { isAvailable: false },
      });
    }

    return NextResponse.json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus menu' },
      { status: 500 }
    );
  }
}
