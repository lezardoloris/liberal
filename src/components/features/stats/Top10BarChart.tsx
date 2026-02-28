'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatEUR, formatCompactEUR, truncate } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';

interface Top10BarChartProps {
  data: Array<{
    id: string;
    title: string;
    amount: number;
    ministryTag: string | null;
  }>;
}

export function Top10BarChart({ data }: Top10BarChartProps) {
  const isMobile = useIsMobile();
  if (data.length === 0) return null;

  const chartData = data.map((item) => ({
    ...item,
    shortTitle: truncate(item.title, isMobile ? 12 : 20),
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
      <h2 className="mb-4 text-base font-semibold text-text-primary">
        Top 10 — Plus gros montants
      </h2>
      <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCompactEUR(v)}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortTitle"
            width={isMobile ? 75 : 130}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: isMobile ? 8 : 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              maxWidth: isMobile ? '200px' : undefined,
              whiteSpace: isMobile ? 'normal' as const : undefined,
            }}
            labelStyle={{ color: 'var(--color-text-primary)' }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
            wrapperStyle={{ zIndex: 40 }}
            formatter={(value) => [isMobile ? formatCompactEUR(Number(value)) : formatEUR(Number(value)), 'Montant']}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.shortTitle === String(label));
              return item?.title ?? String(label);
            }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={index === 0 ? '#ef4444' : '#f59e0b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
