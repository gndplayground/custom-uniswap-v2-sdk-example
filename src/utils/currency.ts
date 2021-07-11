import { Currency, CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

export function formatCurrencyAmount(
  amount: CurrencyAmount<Currency> | undefined,
  sigFigs: number
) {
  if (!amount) {
    return "-";
  }

  if (JSBI.equal(amount.quotient, JSBI.BigInt(0))) {
    return "0";
  }

  if (amount.divide(amount.decimalScale).lessThan(new Fraction(1, 100000))) {
    return "<0.00001";
  }

  return amount.toSignificant(sigFigs);
}
