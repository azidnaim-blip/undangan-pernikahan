import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const whereClause: Record<string, unknown> = {};

    if (statusParam) {
      const statuses = statusParam.split(',');
      whereClause.status = { in: statuses };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName = 'Pelanggan',
      orderType = 'TAKEAWAY',
      paymentMethod = 'CASH',
      items = [],
      discount = 0,
      amountPaid = 0,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Pesanan tidak boleh kosong' },
        { status: 400 }
      );
    }

    // 1. Get active shift if any
    const activeShift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Generate daily sequential order number, e.g. #001
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const countToday = await prisma.order.count({
      where: {
        createdAt: { gte: startOfDay },
      },
    });

    const orderNumber = `#${String(countToday + 1).padStart(3, '0')}`;

    // 3. Calculate order subtotal
    let subtotal = 0;
    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Number(item.unitPrice) || 0;
      const itemSub = Number(item.subtotal ?? (price * qty)) || 0;
      subtotal += itemSub;
    }

    const total = Math.max(0, subtotal - (Number(discount) || 0));
    const paid = Number(amountPaid) || 0;
    const change = paymentMethod === 'CASH' ? Math.max(0, paid - total) : 0;

    // 4. Create transaction inside Prisma transaction:
    // Create Order + OrderItems + Deduct Ingredients + Update Shift
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim() || 'Pelanggan',
          orderType,
          paymentMethod,
          status: 'PENDING',
          subtotal,
          discount: Number(discount) || 0,
          total,
          amountPaid: paid,
          change,
          shiftId: activeShift ? activeShift.id : null,
          items: {
            create: items.map((item: {
              productId?: string;
              productName: string;
              quantity: number;
              unitPrice: number;
              subtotal: number;
              notes?: string;
              modifiersJson?: string;
            }) => {
              const qty = Math.max(1, Number(item.quantity) || 1);
              const price = Number(item.unitPrice) || 0;
              const sub = Number(item.subtotal ?? (price * qty)) || 0;
              return {
                productId: item.productId || null,
                productName: item.productName || 'Menu Item',
                quantity: qty,
                unitPrice: price,
                subtotal: sub,
                notes: item.notes || '',
                modifiersJson: item.modifiersJson || '[]',
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      // 5. Deduct Recipe Ingredients Stock
      let lowStockAlerts: { name: string; current: number; min: number; unit: string }[] = [];

      for (const item of items) {
        if (item.productId) {
          const recipes = await tx.recipeItem.findMany({
            where: { productId: item.productId },
          });

          for (const recipe of recipes) {
            const deduction = recipe.quantity * item.quantity;
            const updatedIng = await tx.ingredient.update({
              where: { id: recipe.ingredientId },
              data: {
                currentStock: {
                  decrement: deduction,
                },
              },
            });
            
            if (updatedIng.currentStock <= updatedIng.minStock) {
              lowStockAlerts.push({
                name: updatedIng.name,
                current: updatedIng.currentStock,
                min: updatedIng.minStock,
                unit: updatedIng.unit
              });
            }
          }
        }
      }

      // 6. Update Shift financial totals
      if (activeShift) {
        if (paymentMethod === 'CASH') {
          await tx.shift.update({
            where: { id: activeShift.id },
            data: {
              totalCashSales: { increment: total },
              expectedCash: { increment: total },
            },
          });
        } else if (paymentMethod === 'QRIS') {
          await tx.shift.update({
            where: { id: activeShift.id },
            data: {
              totalQrisSales: { increment: total },
            },
          });
        }
      }

      return { order, lowStockAlerts };
    });

    const { order, lowStockAlerts } = result;

    // Send WA Notification for Low Stock
    if (lowStockAlerts.length > 0) {
      try {
        const owner = await prisma.user.findFirst({ where: { role: 'OWNER', active: true, phone: { not: null } } });
        if (owner && owner.phone) {
          const itemsList = lowStockAlerts.map(i => `- ${i.name}: Sisa ${i.current} ${i.unit} (Min: ${i.min})`).join('\n');
          const message = `[BrewPoint POS]\n\n⚠️ *Peringatan Stok Menipis*\n\nBahan baku berikut telah mencapai batas minimum atau habis:\n${itemsList}\n\nSegera jadwalkan restock!`;
          
          await fetch('http://localhost:3001/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: owner.phone, message })
          });
        }
      } catch (e) {
        console.error('Failed WA low stock alert:', e);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    );
  }
}
