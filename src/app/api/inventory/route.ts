import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      include: {
        recipes: {
          include: {
            product: true,
          },
        },
      },
    });

    // Format with status and total value
    const formatted = ingredients.map((ing) => {
      let stockStatus = 'NORMAL';
      if (ing.currentStock <= 0) {
        stockStatus = 'EMPTY';
      } else if (ing.currentStock <= ing.minStock) {
        stockStatus = 'LOW';
      }

      const totalValuation = ing.currentStock * ing.costPerUnit;

      return {
        ...ing,
        stockStatus,
        totalValuation,
        usedInCount: ing.recipes.length,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data inventaris' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, unit = 'gr', currentStock = 0, minStock = 100, costPerUnit = 0 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama bahan baku wajib diisi' },
        { status: 400 }
      );
    }

    const newIng = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        unit: unit.trim(),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        costPerUnit: Number(costPerUnit),
      },
    });

    return NextResponse.json(newIng, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan bahan baku' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, addStock, currentStock, minStock, costPerUnit } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID bahan tidak disertakan' }, { status: 400 });
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (addStock !== undefined) {
      dataToUpdate.currentStock = { increment: Number(addStock) };
    } else if (currentStock !== undefined) {
      dataToUpdate.currentStock = Number(currentStock);
    }

    if (minStock !== undefined) {
      dataToUpdate.minStock = Number(minStock);
    }

    if (costPerUnit !== undefined) {
      dataToUpdate.costPerUnit = Number(costPerUnit);
    }

    const updated = await prisma.ingredient.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui bahan baku' },
      { status: 500 }
    );
  }
}
