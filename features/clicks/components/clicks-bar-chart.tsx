'use client';

import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { ChartItem } from '@/features/clicks/labels';

const COLORS = {
  'chart-1': 'var(--chart-1)',
  'chart-2': 'var(--chart-2)',
  'chart-3': 'var(--chart-3)',
  'chart-4': 'var(--chart-4)',
  'chart-5': 'var(--chart-5)',
} as const;

const ROW_HEIGHT = 40;
const LABEL_MAX = 18;

const truncate = (text: string) =>
  text.length > LABEL_MAX ? `${text.slice(0, LABEL_MAX - 1)}…` : text;

interface ClicksBarChartProps {
  data: ChartItem[];
  color?: keyof typeof COLORS;
}

export function ClicksBarChart({ data, color = 'chart-2' }: ClicksBarChartProps) {
  const config = {
    clicks: { label: 'Clics', color: COLORS[color] },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: data.length * ROW_HEIGHT + 8 }}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 40 }}
        barCategoryGap={6}
      >
        <XAxis type="number" dataKey="clicks" hide />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={130}
          tickFormatter={truncate}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="clicks" fill="var(--color-clicks)" radius={5}>
          <LabelList
            dataKey="clicks"
            position="right"
            offset={8}
            className="fill-foreground font-heading tabular-nums"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
