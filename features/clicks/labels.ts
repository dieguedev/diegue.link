import type { BreakdownItem } from '@/domain/services/stats-service';

export type ChartItem = { label: string; clicks: number };

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Móvil',
  desktop: 'Escritorio',
  tablet: 'Tablet',
  other: 'Otro',
};

function flag(code: string) {
  return String.fromCodePoint(
    ...[...code].map(char => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

function countryLabel(code: string) {
  try {
    return `${flag(code)} ${regionNames.of(code) ?? code}`;
  } catch {
    return code;
  }
}

type Kind = 'country' | 'city' | 'referrer' | 'browser' | 'os';

const UNKNOWN: Record<Kind, string> = {
  country: 'Desconocido',
  city: 'Desconocida',
  referrer: 'Directo o desconocido',
  browser: 'Desconocido',
  os: 'Desconocido',
};

export function toChartItems(items: BreakdownItem[], kind: Kind): ChartItem[] {
  return items.map(({ value, clicks }) => {
    if (value === 'other') return { label: 'Otros', clicks };
    if (!value) return { label: UNKNOWN[kind], clicks };
    if (kind === 'country') return { label: countryLabel(value), clicks };
    return { label: value, clicks };
  });
}

export const DEVICE_KEYS = ['mobile', 'desktop', 'tablet', 'other'] as const;
export type DeviceKey = (typeof DEVICE_KEYS)[number];

export function deviceLabel(key: DeviceKey) {
  return DEVICE_LABELS[key];
}

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
