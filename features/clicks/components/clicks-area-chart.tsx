'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { DailyClicks } from '@/domain/services/stats-service';
import { cn } from '@/lib/utils/cn';

const config = {
  clicks: { label: 'Clics', color: 'var(--chart-1)' },
} satisfies ChartConfig;

// Las fechas llegan como 'YYYY-MM-DD'; a mediodía UTC para que ninguna zona horaria cambie el día
const toDate = (day: string) => new Date(`${day}T12:00:00Z`);
const shortDate = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
});
const longDate = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

interface ClicksAreaChartProps {
  data: DailyClicks[];
  className?: string;
}

export function ClicksAreaChart({ data, className }: ClicksAreaChartProps) {
  return (
    <ChartContainer
      config={config}
      className={cn('aspect-auto h-56 w-full sm:h-64', className)}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 0, right: 8, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={day => shortDate.format(toDate(day))}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={32}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) => {
                const day = payload?.[0]?.payload?.date;
                return day ? longDate.format(toDate(day)) : null;
              }}
            />
          }
        />
        <Area
          dataKey="clicks"
          type="monotone"
          fill="var(--color-clicks)"
          stroke="var(--color-border)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
