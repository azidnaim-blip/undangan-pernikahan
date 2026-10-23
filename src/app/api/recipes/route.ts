import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });

    // Calculate actual HPP (Cost of Goods Sold) for each product based on recipe ingredients
    const productsWithHpp = products.map((prod) => {
      let calculatedHpp = 0;
      for (const recipe of prod.recipes) {
        calculatedHpp += recipe.quantity * (recipe.ingredient?.costPerUnit || 0);
      }

      const grossMargin = prod.price > 0 ? ((prod.price - calculatedHpp) / prod.price) * 100 : 0;

      return {
        ...prod,
        calculatedHpp: Math.round(calculatedHpp),
        grossMargin: Math.round(grossMargin),
      };
    });

    return NextResponse.json(productsWithHpp);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data resep' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, ingredientId, quantity } = body;

    if (!productId || !ingredientId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Data resep tidak lengkap' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId,
          ingredientId,
        },
      },
      update: {
        quantity: Number(quantity),
      },
      create: {
        productId,
        ingredientId,
        quantity: Number(quantity),
      },
      include: {
        ingredient: true,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan data resep' },
      { status: 500 }
    );
  }
}
