export interface FilterOption {
  key: string;
  label: string;
  count: number;
}

export function countOptions<K extends string>(keys: readonly K[], order: readonly K[], label: (key: K) => string): FilterOption[] {
  const counts = new Map<K, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return order.filter((key) => counts.has(key)).map((key) => ({ key, label: label(key), count: counts.get(key) ?? 0 }));
}

export function matchesFilter(key: string, category: string | undefined): boolean {
  return key === 'all' || category === key;
}
