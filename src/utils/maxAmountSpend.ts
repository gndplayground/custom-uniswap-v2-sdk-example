import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { parseEther } from "@ethersproject/units";
import { SupportedChainId } from "../constants/chain";

const MIN_NATIVE_CURRENCY_FOR_GAS: { [key: number]: JSBI } = {
  [SupportedChainId.BSC]: JSBI.BigInt(parseEther("0.01")),
  [SupportedChainId.MATIC]: JSBI.BigInt(parseEther("0.01")),
  [SupportedChainId.AVAX]: JSBI.BigInt(parseEther("0.01")),
};

export function maxAmountSpend(
  currencyAmount: CurrencyAmount<Currency> | undefined,
  chainId: number
): CurrencyAmount<Currency> | undefined {
  const defaultGas = JSBI.BigInt(parseEther("0.01"));

  if (!currencyAmount) return undefined;
  if (currencyAmount.currency.isNative) {
    if (
      JSBI.greaterThan(
        currencyAmount.quotient,
        MIN_NATIVE_CURRENCY_FOR_GAS[chainId] || defaultGas
      )
    ) {
      return CurrencyAmount.fromRawAmount(
        currencyAmount.currency,
        JSBI.subtract(
          currencyAmount.quotient,
          MIN_NATIVE_CURRENCY_FOR_GAS[chainId]
        ) || defaultGas
      );
    } else {
      return CurrencyAmount.fromRawAmount(
        currencyAmount.currency,
        JSBI.BigInt(0)
      );
    }
  }
  return currencyAmount;
}
