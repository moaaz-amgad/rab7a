/**
 * Formats piasters (integer) into localized Egyptian Pound currency string (ج.م).
 */
export function formatMoney(piasters: number, showSymbol: boolean = true): string {
  const egp = (piasters || 0) / 100;
  const formatted = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(egp);

  return showSymbol ? `${formatted} ج.م` : formatted;
}

/**
 * Converts EGP input number to piasters integer.
 */
export function toPiasters(egp: number): number {
  return Math.round(egp * 100);
}
