import React from 'react';
import { formatMoney } from '@/utils/money';

interface MoneyDisplayProps {
  amount: number; // in piasters
  showSymbol?: boolean;
  type?: 'positive' | 'negative' | 'neutral';
  className?: string;
  style?: React.CSSProperties;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  showSymbol = true,
  type = 'neutral',
  className = '',
  style,
}) => {
  let color = 'inherit';
  if (type === 'positive') color = '#2e7d32';
  if (type === 'negative') color = '#c62828';

  return (
    <span
      className={`font-mono ${className}`}
      style={{
        direction: 'ltr',
        display: 'inline-block',
        color,
        fontWeight: 600,
        ...style,
      }}
    >
      {formatMoney(amount, showSymbol)}
    </span>
  );
};
