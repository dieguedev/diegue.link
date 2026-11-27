import type { BreakdownItem } from '@/domain/services/stats-service';

export type ChartItem = { label: string; clicks: number };

export type BreakdownKind = 'country' | 'city' | 'referrer' | 'browser' | 'os';

export type ChartLabels = {
  locale: string;
  other: string;
  unknown: string;
};

function flag(code: string) {
  return String.fromCodePoint(
    ...[...code].map(char => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

function countryLabel(code: string, locale: string) {
  try {
    const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
    return `${flag(code)} ${regionNames.of(code) ?? code}`;
  } catch {
    return code;
  }
}

export function toChartItems(
  items: BreakdownItem[],
  kind: BreakdownKind,
  labels: ChartLabels,
): ChartItem[] {
  return items.map(({ value, clicks }) => {
    if (value === 'other') return { label: labels.other, clicks };
    if (!value) return { label: labels.unknown, clicks };
    if (kind === 'country')
      return { label: countryLabel(value, labels.locale), clicks };
    return { label: value, clicks };
  });
}

export const DEVICE_KEYS = ['mobile', 'desktop', 'tablet', 'other'] as const;
export type DeviceKey = (typeof DEVICE_KEYS)[number];

export function toDeviceItems(items: BreakdownItem[]) {
  const totals = new Map<DeviceKey, number>();
  for (const { value, clicks } of items) {
    const key = DEVICE_KEYS.includes(value as DeviceKey)
      ? (value as DeviceKey)
      : 'other';
    totals.set(key, (totals.get(key) ?? 0) + clicks);
  }
  return DEVICE_KEYS.filter(key => totals.has(key)).map(device => ({
    device,
    clicks: totals.get(device)!,
  }));
}
