import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    
    const dailyData: Record<string, number> = {};
    const chartData = [];

    // Init last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      
      // label like 'Sen', 'Sel'
      const shortLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });
      
      dailyData[key] = 0;
      chartData.push({ date: key, label: shortLabel, total: 0 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'COMPLETED'
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      
      if (dailyData[key] !== undefined) {
        dailyData[key] += o.total;
      }
    });

    const finalChart = chartData.map(c => ({
      ...c,
      total: dailyData[c.date]
    }));

    const total7Days = finalChart.reduce((sum, item) => sum + item.total, 0);
    const avgDaily = total7Days / 7;

    return NextResponse.json({ chartData: finalChart, total7Days, avgDaily });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
