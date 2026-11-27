'use client';

import { Label, Pie, PieChart } from 'recharts';
import { useTranslations } from 'next-intl';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { DeviceKey } from '@/features/clicks/labels';
import { numberFormat } from '@/lib/utils/number-format';

interface DevicesDonutChartProps {
  data: { device: DeviceKey; clicks: number }[];
}

export function DevicesDonutChart({ data }: DevicesDonutChartProps) {
  const t = useTranslations('Clicks');
  const config = {
    clicks: { label: t('clicks') },
    mobile: { label: t('devices.mobile'), color: 'var(--chart-1)' },
    desktop: { label: t('devices.desktop'), color: 'var(--chart-2)' },
    tablet: { label: t('devices.tablet'), color: 'var(--chart-3)' },
    other: { label: t('devices.other'), color: 'var(--chart-4)' },
  } satisfies ChartConfig;
  const total = data.reduce((acc, item) => acc + item.clicks, 0);
  const slices = data.map(item => ({
    ...item,
    fill: `var(--color-${item.device})`,
  }));

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-64">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="device" />}
        />
        <Pie
          data={slices}
          dataKey="clicks"
          nameKey="device"
          innerRadius={58}
          strokeWidth={2}
        >
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                return null;
              }
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground font-heading text-2xl tabular-nums"
                  >
                    {numberFormat(total)}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) + 22}
                    className="fill-foreground/70 text-xs"
                  >
                    {t('clicks')}
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend
          content={
            <ChartLegendContent nameKey="device" className="flex-wrap" />
          }
        />
      </PieChart>
    </ChartContainer>
  );
}
