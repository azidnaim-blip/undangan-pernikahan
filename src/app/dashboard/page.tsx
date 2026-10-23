'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { formatRupiah } from '@/lib/utils';
import { TrendingUp, BarChart3, Clock, DollarSign } from 'lucide-react';
import RoleGuard from '@/components/auth/RoleGuard';

interface ChartPoint {
  date: string;
  label: string;
  total: number;
}

interface DashboardData {
  chartData: ChartPoint[];
  total7Days: number;
  avgDaily: number;
}

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8F6F2]">
        <div className="w-8 h-8 border-4 border-[#C2552D]/20 border-t-[#C2552D] rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate SVG chart logic
  const width = 800;
  const height = 300;
  const paddingX = 40;
  const paddingY = 40;

  const maxTotal = Math.max(...data.chartData.map(d => d.total), 100000);
  const minTotal = 0;

  const points = data.chartData.map((d, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (data.chartData.length - 1 || 1);
    const y = height - paddingY - ((d.total - minTotal) / (maxTotal - minTotal)) * (height - 2 * paddingY);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F6F2] overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-black/[0.05] bg-white/75 backdrop-blur-3xl sticky top-0 z-10 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Dashboard Owner</h1>
          <p className="text-[13px] text-[#86868B] font-medium mt-1">Metrik dan performa penjualan mingguan kafe Anda</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#C2552D]/10 flex items-center justify-center text-[#C2552D] shrink-0">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#86868B]">Total Omset (7 Hari Terakhir)</div>
              <div className="text-[28px] font-bold text-[#1D1D1F] tracking-tight mt-1">
                {formatRupiah(data.total7Days)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] shrink-0">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#86868B]">Rata-rata Harian</div>
              <div className="text-[28px] font-bold text-[#1D1D1F] tracking-tight mt-1">
                {formatRupiah(data.avgDaily)}
              </div>
            </div>
          </div>
        </div>

        {/* Sales Chart Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[19px] font-bold text-[#1D1D1F]">Tren Penjualan Harian</h2>
              <p className="text-[13px] text-[#86868B] mt-1">Grafik performa total pendapatan per hari</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/[0.04] text-[#1D1D1F]">
              <span className="w-2 h-2 rounded-full bg-[#C2552D]" />
              Omset Transaksi
            </div>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar pt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px] overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C2552D" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#C2552D" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + ratio * (height - 2 * paddingY);
                return (
                  <line
                    key={ratio}
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="rgba(0,0,0,0.05)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Gradient Fill Under Line */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Smooth Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#C2552D"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((pt, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    className="fill-white stroke-[#C2552D] stroke-[3] group-hover:r-[7] transition-all"
                  />
                  {/* Tooltip Hover Overlay */}
                  <rect
                    x={pt.x - 45}
                    y={pt.y - 42}
                    width="90"
                    height="28"
                    rx="8"
                    className="fill-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  />
                  <text x={pt.x} y={pt.y - 25} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {formatRupiah(pt.data.total)}
                  </text>
                  
                  {/* X Axis Label */}
                  <text x={pt.x} y={height - paddingY + 20} fontSize="11" fill="#86868B" textAnchor="middle" fontWeight="500" fontFamily="sans-serif">
                    {pt.data.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardContent />
    </RoleGuard>
  );
}
