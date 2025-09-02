/**
 * Tax calculation for Australian payroll
 * Simplified tax brackets as specified in PRD
 */

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  base: number;
}

/**
 * Tax brackets for the pay period (as specified in PRD)
 */
export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 370, rate: 0, base: 0 },
  { min: 370.01, max: 900, rate: 0.10, base: 0 },
  { min: 900.01, max: 1500, rate: 0.19, base: 53 }, // 10% of (900-370) = 53
  { min: 1500.01, max: 3000, rate: 0.325, base: 167 }, // 53 + 19% of (1500-900) = 167
  { min: 3000.01, max: 5000, rate: 0.37, base: 654.5 }, // 167 + 32.5% of (3000-1500) = 654.5
  { min: 5000.01, max: Infinity, rate: 0.45, base: 1394.5 } // 654.5 + 37% of (5000-3000) = 1394.5
];

/**
 * Calculate tax for a given gross amount
 * @param gross - The gross amount for the pay period
 * @returns The calculated tax amount
 */
export function calculateTax(gross: number): number {
  if (gross <= 0) return 0;

  // Find the appropriate tax bracket
  const bracket = TAX_BRACKETS.find(b => gross >= b.min && gross <= b.max);
  
  if (!bracket) {
    // If no bracket found, use the highest bracket
    const highestBracket = TAX_BRACKETS[TAX_BRACKETS.length - 1];
    const excessAmount = gross - highestBracket.min;
    return Math.round((highestBracket.base + (excessAmount * highestBracket.rate)) * 100) / 100;
  }

  if (bracket.rate === 0) {
    return 0;
  }

  const excessAmount = gross - bracket.min + 0.01;
  const tax = bracket.base + (excessAmount * bracket.rate);
  
  // Round to 2 decimal places
  return Math.round(tax * 100) / 100;
}

/**
 * Calculate superannuation
 * @param gross - The gross amount
 * @param superRate - The super rate (default 11.5% = 0.115)
 * @returns The calculated super amount
 */
export function calculateSuper(gross: number, superRate: number = 0.115): number {
  if (gross <= 0) return 0;
  
  const super_ = gross * superRate;
  return Math.round(super_ * 100) / 100;
}

/**
 * Calculate net pay
 * @param gross - The gross amount
 * @param tax - The tax amount
 * @returns The net pay amount
 */
export function calculateNet(gross: number, tax: number): number {
  const net = gross - tax;
  return Math.round(net * 100) / 100;
}
