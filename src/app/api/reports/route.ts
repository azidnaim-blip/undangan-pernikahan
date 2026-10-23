import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';

    const now = new Date();
    const startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // all time: 1 year ago
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                recipes: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalCashSales = 0;
    let totalQrisSales = 0;
    let totalEstimatedHpp = 0;

    // Peak hours mapping (0-23)
    const hourlyDistribution: { [hour: number]: { hour: string; count: number; revenue: number } } = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = {
        hour: `${String(i).padStart(2, '0')}:00`,
        count: 0,
        revenue: 0,
      };
    }

    // Best sellers mapping
    const productStats: {
      [name: string]: {
        name: string;
        categoryName: string;
        quantity: number;
        revenue: number;
        hpp: number;
      };
    } = {};

    // Category breakdown
    const categoryStats: { [name: string]: { name: string; quantity: number; revenue: number } } = {};

    for (const order of orders) {
      totalRevenue += order.total;
      totalDiscount += order.discount;

      if (order.paymentMethod === 'CASH') {
        totalCashSales += order.total;
      } else if (order.paymentMethod === 'QRIS') {
        totalQrisSales += order.total;
      }

      const orderHour = new Date(order.createdAt).getHours();
      hourlyDistribution[orderHour].count += 1;
      hourlyDistribution[orderHour].revenue += order.total;

      for (const item of order.items) {
        // Calculate item HPP
        let itemHpp = 0;
        let catName = 'Lainnya';

        if (item.product) {
          catName = item.product.category?.name || 'Lainnya';
          for (const recipe of item.product.recipes) {
            itemHpp += recipe.quantity * (recipe.ingredient?.costPerUnit || 0);
          }
        }

        const totalItemHpp = itemHpp * item.quantity;
        totalEstimatedHpp += totalItemHpp;

        // Product stats
        if (!productStats[item.productName]) {
          productStats[item.productName] = {
            name: item.productName,
            categoryName: catName,
            quantity: 0,
            revenue: 0,
            hpp: 0,
          };
        }
        productStats[item.productName].quantity += item.quantity;
        productStats[item.productName].revenue += item.subtotal;
        productStats[item.productName].hpp += totalItemHpp;

        // Category stats
        if (!categoryStats[catName]) {
          categoryStats[catName] = { name: catName, quantity: 0, revenue: 0 };
        }
        categoryStats[catName].quantity += item.quantity;
        categoryStats[catName].revenue += item.subtotal;
      }
    }

    const userRole = request.headers.get('x-user-role');
    const isOwner = !userRole || userRole === 'OWNER' || userRole === 'ADMIN';

    const grossProfit = totalRevenue - totalEstimatedHpp;
    const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const bestSellers = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        hpp: isOwner ? item.hpp : 0,
      }));

    const categoryBreakdown = Object.values(categoryStats).sort(
      (a, b) => b.revenue - a.revenue
    );

    const peakHours = Object.values(hourlyDistribution).filter((h) => {
      // Filter hours between 07:00 and 23:00 for cafe peak hours clarity
      const hourNum = parseInt(h.hour.split(':')[0], 10);
      return hourNum >= 7 && hourNum <= 22;
    });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue: Math.round(averageOrderValue),
        totalEstimatedHpp: isOwner ? Math.round(totalEstimatedHpp) : 0,
        grossProfit: isOwner ? Math.round(grossProfit) : 0,
        profitMarginPercent: isOwner ? Math.round(profitMarginPercent) : 0,
        totalCashSales,
        totalQrisSales,
        totalDiscount,
      },
      peakHours,
      bestSellers,
      categoryBreakdown,
      recentOrders: orders.slice(0, 50).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        orderType: o.orderType,
        paymentMethod: o.paymentMethod,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        itemCount: o.items.reduce((acc, it) => acc + it.quantity, 0),
        itemsSummary: o.items.map((it) => `${it.quantity}x ${it.productName}`).join(', '),
      })),
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil laporan penjualan' },
      { status: 500 }
    );
  }
}
