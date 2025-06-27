export function plnToCents(amount: number | string): number {
  return Math.round(Number(amount) * 100);
}

export function centsToPln(amount: number): string {
  return (amount / 100).toFixed(2).replace('.', ',');
}
