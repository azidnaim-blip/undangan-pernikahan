import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            modifierGroups: {
              include: {
                modifierGroup: {
                  include: {
                    options: {
                      orderBy: { sortOrder: 'asc' },
                    },
                  },
                },
              },
            },
            recipes: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // Also check current stock status for each product based on ingredients
    const formattedCategories = categories.map((category) => ({
      ...category,
      products: category.products.map((product) => {
        let isOutOfStock = false;
        let lowestPortions = 999999;

        for (const recipe of product.recipes) {
          if (recipe.quantity > 0) {
            const portionsPossible = Math.floor(
              recipe.ingredient.currentStock / recipe.quantity
            );
            if (portionsPossible < lowestPortions) {
              lowestPortions = portionsPossible;
            }
            if (recipe.ingredient.currentStock < recipe.quantity) {
              isOutOfStock = true;
            }
          }
        }

        return {
          ...product,
          isOutOfStock,
          estimatedStockLeft: lowestPortions === 999999 ? 99 : lowestPortions,
        };
      }),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      description,
      image,
      categoryId,
      newCategoryName,
      isBeverage = true,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama menu wajib diisi' },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { error: 'Harga menu tidak valid' },
        { status: 400 }
      );
    }

    let targetCategoryId = categoryId;

    // Handle new category creation
    if (!targetCategoryId && newCategoryName && newCategoryName.trim()) {
      let cat = await prisma.category.findFirst({
        where: { name: newCategoryName.trim() },
      });
      if (!cat) {
        cat = await prisma.category.create({
          data: {
            name: newCategoryName.trim(),
            sortOrder: 99,
          },
        });
      }
      targetCategoryId = cat.id;
    }

    if (!targetCategoryId) {
      // Default to first category
      const firstCat = await prisma.category.findFirst({
        orderBy: { sortOrder: 'asc' },
      });
      if (firstCat) {
        targetCategoryId = firstCat.id;
      } else {
        const createdCat = await prisma.category.create({
          data: { name: 'Coffee', sortOrder: 1 },
        });
        targetCategoryId = createdCat.id;
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: numPrice,
        description: description ? description.trim() : null,
        image: image || null,
        categoryId: targetCategoryId,
        isAvailable: true,
      },
    });

    // If beverage, link to modifier groups (Size, Suhu, Gula, Es, Susu, Add-ons)
    if (isBeverage) {
      const modifierGroups = await prisma.modifierGroup.findMany();
      for (const mg of modifierGroups) {
        await prisma.productModifierGroup.upsert({
          where: {
            productId_modifierGroupId: {
              productId: product.id,
              modifierGroupId: mg.id,
            },
          },
          create: {
            productId: product.id,
            modifierGroupId: mg.id,
          },
          update: {},
        });
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Gagal membuat menu baru' },
      { status: 500 }
    );
  }
}
