import { clsx, type ClassValue } from 'clsx';
import { time } from 'console';
import { twMerge } from 'tailwind-merge';

interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  format?: 'standard' | 'compact' | 'simple';
  showSymbol?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const FormattedDate: React.FC<{ date: string | null, defaultText?: string }> = ({ 
    date, 
    defaultText = 'Sin fecha' 
}) => {
    if (!date) return defaultText
    return new Date(date).toLocaleDateString()
}

export const formatTime: React.FC<{ time: string | null }> = ({ time }) => {
  if (!time) return null;
  
  return (
    new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(time))  );
};


interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  format?: 'standard' | 'compact' | 'simple';
  showSymbol?: boolean;
}

export const formatCurrency = (
  amount: number | string,
  options: FormatCurrencyOptions = {}
): string => {
  try {
    const {
      currency = 'MXN',
      locale = 'es-MX',
      decimals = 2,
      format = 'standard',
      showSymbol = true
    } = options;

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return '$0.00';
    }

    const formatOptions: Intl.NumberFormatOptions = {
      style: showSymbol ? 'currency' : 'decimal',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    };

    if (format === 'compact') {
      formatOptions.notation = 'compact';
    }

    const formatted = new Intl.NumberFormat(locale, formatOptions).format(numericAmount);

    if (format === 'simple') {
      return showSymbol ? `$${numericAmount.toFixed(decimals)}` : numericAmount.toFixed(decimals);
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '$0.00';
  }
};


export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case "cash": return "Efectivo";
    case "transfer": return "Transferencia";
    case "card": return "Tarjeta";
    default: return method;
  }
}