import { Caja, Transaction, Gasto, Denomination } from '@/lib/types';
function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
/**
 * Calcula el total de ingresos en efectivo de una caja
 */
export function calculateCashIngresos(transactions: Transaction[] = []): number {
  return transactions
    .filter((t) => t.payment_method === 'cash') 
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Calcula el total de gastos en efectivo de una caja
 */
export function calculateCashGastos(gastos: Gasto[] = []): number {
  return gastos
    .filter((g) => g.method === 'cash' || g.method === 'Efectivo')
    .reduce((sum, g) => sum + Number(g.amount || 0), 0);
}

/**
 * Calcula todos los totales de una caja (efectivo y general)
 */
export interface CajaTotals {
  // Totales generales
  ingresos: number;
  gastos: number;
  balance: number;
  
  // Totales en efectivo
  cashIngresos: number;
  cashGastos: number;
  cashBalance: number;
  
  // Balance final
  finalBalance: number; // initial_amount + cashIngresos - cashGastos
  
  // Contadores
  transactionCount: number;
  gastoCount: number;
  cashTransactionCount: number;
  cashGastoCount: number;
}

export function calculateCajaTotals(caja: Caja): CajaTotals {
  const transactions = caja.transactions || [];
  const gastos = caja.gastos || [];
  
  // Ingresos totales (todos los pagados)
  const ingresos = transactions
    .filter((t) => t.transaction_type === 'income' && t.paid === 1)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  // Gastos totales
  const gastosTotal = gastos
    .reduce((sum, g) => sum + Number(g.amount || 0), 0);
  
  // Ingresos en efectivo
  const cashIngresos = calculateCashIngresos(transactions);
  
  // Gastos en efectivo
  const cashGastos = calculateCashGastos(gastos);
  
  // Balance en efectivo
  const cashBalance = cashIngresos - cashGastos;
  
  // Balance final considerando el monto inicial
  const finalBalance = Number(caja.initial_amount || 0) + cashBalance;
  
  // Contadores
  const transactionCount = transactions.filter(
    (t) => t.transaction_type === 'income' && t.paid === 1
  ).length;
  
  const gastoCount = gastos.length;
  
  const cashTransactionCount = transactions.filter(
    (t) => t.payment_method === 'cash'
  ).length;
  
  const cashGastoCount = gastos.filter(
    (g) => g.method === 'cash' || g.method === 'Efectivo'
  ).length;
  
  return {
    ingresos,
    gastos: gastosTotal,
    balance: ingresos - gastosTotal,
    cashIngresos,
    cashGastos,
    cashBalance,
    finalBalance,
    transactionCount,
    gastoCount,
    cashTransactionCount,
    cashGastoCount,
  };
}

/**
 * FUNCIÓN PRINCIPAL - Procesa completamente una caja con todos los cálculos necesarios
 * Esta es la función "todo en uno" que reemplaza a processCashRegister y processCajaData
 */
export interface ProcessedCajaData {
  // Información básica
  id: number;
  status: string;
  opened_at: string | null;
  closed_at: string | null;
  
  // Montos
  initial_amount: number;
  final_amount: number | null;
  next_day: number | null;
  
  // Totales calculados
  totals: CajaTotals;
  
  // Transacciones y gastos filtrados (solo efectivo)
  cashTransactions: Transaction[];
  cashGastos: Gasto[];
  
  // Diferencia entre final_amount y finalBalance calculado
  difference: number | null;
  isBalanced: boolean;
  
  // Desglose de denominaciones (para cierre de caja)
  denominationBreakdown: Record<string, number>;
  actualCashAmount: number; // Total según denominaciones
}

export function processCajaData(caja: Caja): ProcessedCajaData {
  const totals = calculateCajaTotals(caja);
  
  // Filtrar transacciones y gastos en efectivo
  const cashTransactions = (caja.transactions || []).filter(
    (t) => t.payment_method === 'cash' 
  );
  
  console.log(cashTransactions);
  const cashGastos = (caja.gastos || []).filter(
    (g) => g.method === 'cash' || g.method === 'Efectivo'
  );
  
  // Procesar denominaciones del monto inicial
  const denominationBreakdown: Record<string, number> = {};
  if (caja.initial_amount_cash) {
    const initialCash = typeof caja.initial_amount_cash === 'string'
      ? JSON.parse(caja.initial_amount_cash)
      : caja.initial_amount_cash;

    Object.entries(initialCash).forEach(([value, quantity]) => {
      denominationBreakdown[value] = (denominationBreakdown[value] || 0) + Number(quantity || 0);
    });
  }
  
  // Calcular total según denominaciones
  const actualCashAmount = Object.entries(denominationBreakdown).reduce(
    (total, [value, quantity]) => total + Number(value) * Number(quantity),
    0
  );
  
  // Calcular diferencia solo si hay final_amount
  const difference = caja.final_amount !== null && caja.final_amount !== undefined
    ? Number(caja.final_amount) - totals.finalBalance
    : null;
  
  const isBalanced = difference !== null ? Math.abs(difference) < 0.01 : false;
  
  return {
    id: caja.id!,
    status: caja.status,
    opened_at: caja.opened_at || null,
    closed_at: caja.closed_at || null,
    initial_amount: Number(caja.initial_amount || 0),
    final_amount: caja.final_amount !== null ? Number(caja.final_amount) : null,
    next_day: caja.next_day !== null && caja.next_day !== undefined ? Number(caja.next_day) : null,
    totals,
    cashTransactions,
    cashGastos,
    difference,
    isBalanced,
    denominationBreakdown,
    actualCashAmount: round2(actualCashAmount),
  };
}

/**
 * Formatea los datos de una caja para mostrar en tablas
 */
export interface CajaTableRow {
  id: number;
  status: string;
  opened_at: string;
  closed_at: string;
  initial_amount: number;
  final_amount: number | null;
  ingresos: number;
  gastos: number;
  balance: number;
  cashIngresos: number;
  cashGastos: number;
  cashBalance: number;
}

export function formatCajaForTable(caja: Caja): CajaTableRow {
  const processed = processCajaData(caja);
  
  return {
    id: processed.id,
    status: processed.status,
    opened_at: processed.opened_at || '-',
    closed_at: processed.closed_at || '-',
    initial_amount: processed.initial_amount,
    final_amount: processed.final_amount,
    ingresos: processed.totals.ingresos,
    gastos: processed.totals.gastos,
    balance: processed.totals.balance,
    cashIngresos: processed.totals.cashIngresos,
    cashGastos: processed.totals.cashGastos,
    cashBalance: processed.totals.cashBalance,
  };
}

/**
 * Calcula el total de denominaciones
 */
export function calculateDenominationsTotal(
  denominations: Record<string, number> | Denomination | undefined
): number {
  if (!denominations) return 0;
  
  return Object.entries(denominations).reduce((total, [denom, count]) => {
    return total + Number(denom) * (Number(count) || 0);
  }, 0);
}

/**
 * Valida si el cierre de caja está balanceado
 */
export function validateCajaBalance(
  finalAmount: number,
  expectedAmount: number,
  tolerance: number = 0.01
): {
  isValid: boolean;
  difference: number;
  message: string;
} {
  const difference = finalAmount - expectedAmount;
  const isValid = Math.abs(difference) <= tolerance;
  
  let message = '';
  if (!isValid) {
    if (difference > 0) {
      message = `Hay un sobrante de $${Math.abs(difference).toFixed(2)}`;
    } else {
      message = `Falta $${Math.abs(difference).toFixed(2)}`;
    }
  }
  
  return {
    isValid,
    difference,
    message,
  };
}
