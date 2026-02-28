'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatEUR } from '@/lib/utils/format';

interface CategoryPieChartProps {
  data: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
}

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1',
  '#14b8a6', '#a855f7', '#e11d48', '#0ea5e9', '#eab308',
  '#22c55e',
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-4">
      <h2 className="mb-4 text-base font-semibold text-text-primary">
        Repartition par categorie
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalAmount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, index) => (
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
            formatter={(value) => formatEUR(Number(value))}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: 'var(--color-text-muted)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
