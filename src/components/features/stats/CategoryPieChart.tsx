'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatEUR, formatCompactEUR } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';

interface CategoryPieChartProps {
  data: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
}

const COLORS = [
  '#C62828', '#9B1C1C', '#7F1D1D', '#991B1B', '#B91C1C',
  '#737373', '#525252', '#6B7280', '#4B5563', '#404040',
  '#A3A3A3', '#8B8B8B', '#5C5C5C', '#6E6E6E', '#808080',
  '#959595',
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const isMobile = useIsMobile();
  if (data.length === 0) return null;

  // Sort by amount descending and take top 8, merge rest into "Autres"
  const sorted = [...data].sort((a, b) => b.totalAmount - a.totalAmount);
  const top = sorted.slice(0, 8);
  const rest = sorted.slice(8);
  const chartData = rest.length > 0
    ? [...top, { category: 'Autres', count: rest.reduce((s, r) => s + r.count, 0), totalAmount: rest.reduce((s, r) => s + r.totalAmount, 0) }]
    : top;

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
      <h2 className="mb-4 text-base font-semibold text-text-primary">
        Repartition par categorie
      </h2>
      <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="totalAmount"
            nameKey="category"
            cx="50%"
            cy="45%"
            innerRadius={isMobile ? 40 : 55}
            outerRadius={isMobile ? 70 : 100}
            paddingAngle={2}
            stroke="var(--color-surface-secondary)"
            strokeWidth={2}
            label={isMobile ? false : ({ name, percent }: { name?: string; percent?: number }) =>
              (percent ?? 0) > 0.05 ? `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
            }
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'var(--color-text-primary)' }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
            wrapperStyle={{ zIndex: 40 }}
            formatter={(value) => [isMobile ? formatCompactEUR(Number(value)) : formatEUR(Number(value)), 'Montant']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
