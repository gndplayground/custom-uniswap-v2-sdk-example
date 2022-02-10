import {
  Currency,
  CurrencyAmount,
  Fraction,
  Percent,
  TradeType,
} from "@uniswap/sdk-core";
import { parseUnits } from "@ethersproject/units";
import JSBI from "jsbi";
import { Field } from "../../types";
import { useAllCommonPairs } from "../pairs";
import { Trade } from "custom-uniswap-v2-sdk";
import React, { useMemo } from "react";
import { SupportedChainId } from "../../constants/chain";
import useWallet from "../useWallet";
import { useTransactionSettingStore } from "../../stores/transactionSetting";
import { getTokenSymbol } from "../../utils/tokens";

const BIPS_BASE = JSBI.BigInt(10000);

const ZERO_PERCENT = new Percent("0");

const ONE_HUNDRED_PERCENT = new Percent("1");

const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(
  JSBI.BigInt(50),
  BIPS_BASE
);

const INPUT_FRACTION_AFTER_FEES: { [chainId: number]: Percent } = {
  [SupportedChainId.BSC]: ONE_HUNDRED_PERCENT.subtract(
    new Percent(JSBI.BigInt(25), JSBI.BigInt(10000))
  ),
  [SupportedChainId.MATIC]: ONE_HUNDRED_PERCENT.subtract(
    new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
  ),
  [SupportedChainId.AVAX]: ONE_HUNDRED_PERCENT.subtract(
    new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
  ),
};

export function isTradeBetter(
  tradeA: Trade<Currency, Currency, TradeType> | undefined | null,
  tradeB: Trade<Currency, Currency, TradeType> | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT
): boolean | undefined {
  if (tradeA && !tradeB) return false;
  if (tradeB && !tradeA) return true;
  if (!tradeA || !tradeB) return undefined;

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeB.outputAmount.currency.equals(tradeB.outputAmount.currency)
  ) {
    throw new Error("Comparing incomparable trades");
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice);
  } else {
    return tradeA.executionPrice.asFraction
      .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
      .lessThan(tradeB.executionPrice);
  }
}

export function tryParseAmount<T extends Currency>(
  value?: string,
  currency?: T
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== "0") {
      return CurrencyAmount.fromRawAmount(
        currency,
        JSBI.BigInt(typedValueParsed)
      );
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    // eslint-disable-next-line no-console
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

const MAX_HOPS = 3;

export function useV2TradeExactIn(
  currencyAmountIn?: CurrencyAmount<Currency>,
  currencyOut?: Currency,
  { maxHops = MAX_HOPS } = {}
): Trade<Currency, Currency, TradeType.EXACT_INPUT> | null {
  const allowedPairs = useAllCommonPairs(
    currencyAmountIn?.currency,
    currencyOut
  );

  return useMemo(() => {
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      if (maxHops === 1) {
        return (
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: 1,
            maxNumResults: 1,
          })[0] ?? null
        );
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade<
        Currency,
        Currency,
        TradeType.EXACT_INPUT
      > | null = null;
      for (let i = 1; i <= maxHops; i++) {
        const currentTrade: Trade<
          Currency,
          Currency,
          TradeType.EXACT_INPUT
        > | null =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: i,
            maxNumResults: 1,
          })[0] ?? null;
        // if current trade is best yet, save it
        if (
          isTradeBetter(
            bestTradeSoFar,
            currentTrade,
            BETTER_TRADE_LESS_HOPS_THRESHOLD
          )
        ) {
          bestTradeSoFar = currentTrade;
        }
      }
      return bestTradeSoFar;
    }

    return null;
    // Force update trade every block
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedPairs, currencyAmountIn, currencyOut, maxHops]);
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useV2TradeExactOut(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount<Currency>,
  { maxHops = MAX_HOPS } = {}
): Trade<
  Currency,
  Currency,
  TradeType.EXACT_OUTPUT | TradeType.EXACT_INPUT
> | null {
  const allowedPairs = useAllCommonPairs(
    currencyIn,
    currencyAmountOut?.currency
  );

  return useMemo(() => {
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      if (maxHops === 1) {
        return (
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
            maxHops: 1,
            maxNumResults: 1,
          })[0] ?? null
        );
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade<
        Currency,
        Currency,
        TradeType.EXACT_OUTPUT
      > | null = null;
      for (let i = 1; i <= maxHops; i++) {
        const currentTrade =
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
            maxHops: i,
            maxNumResults: 1,
          })[0] ?? null;
        if (
          isTradeBetter(
            bestTradeSoFar,
            currentTrade,
            BETTER_TRADE_LESS_HOPS_THRESHOLD
          )
        ) {
          bestTradeSoFar = currentTrade;
        }
      }
      return bestTradeSoFar;
    }
    return null;
  }, [currencyIn, currencyAmountOut, allowedPairs, maxHops]);
}

export function useTrade(options: {
  independentField: Field;
  fields: {
    [Field.INPUT]: Currency | undefined;
    [Field.OUTPUT]: Currency | undefined;
  };
  typedValue: string;
}) {
  const { typedValue, independentField, fields } = options;

  const inputCurrency = fields[Field.INPUT];

  const outputCurrency = fields[Field.OUTPUT];

  const isExactIn: boolean = independentField === Field.INPUT;

  const parsedAmount = tryParseAmount(
    typedValue,
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined
  );

  const bestTradeExactIn = useV2TradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    {
      maxHops: undefined,
    }
  );

  const bestTradeExactOut = useV2TradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
    {
      maxHops: undefined,
    }
  );

  return {
    trade: isExactIn ? bestTradeExactIn : bestTradeExactOut,
    parsedAmount,
  };
}

export function computeSlippageAdjustedAmounts(
  trade: Trade<Currency, Currency, TradeType> | undefined | null,
  allowedSlippage: number
): { INPUT?: CurrencyAmount<Currency>; OUTPUT?: CurrencyAmount<Currency> } {
  function basisPointsToPercent(num: number): Percent {
    return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
  }
  const pct = basisPointsToPercent(allowedSlippage);
  return {
    INPUT: trade?.maximumAmountIn(pct),
    OUTPUT: trade?.minimumAmountOut(pct),
  };
}

export function computeRealizedLPFeePercent(
  trade: Trade<Currency, Currency, TradeType>,
  fractionAfterFee: Percent
): Percent {
  const percent: Percent = ONE_HUNDRED_PERCENT.subtract(
    trade.route.pairs.reduce<Percent>(
      (currentFee: Percent): Percent => currentFee.multiply(fractionAfterFee),
      ONE_HUNDRED_PERCENT
    )
  );

  return new Percent(percent.numerator, percent.denominator);
}

export function computeTradePriceBreakdown(
  trade: Trade<Currency, Currency, TradeType> | null | undefined,
  fractionAfterFee: Percent
): {
  priceImpactWithoutFee: Percent | undefined;
  realizedLPFee: CurrencyAmount<Currency> | undefined | null;
} {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction =>
            currentFee.multiply(fractionAfterFee),
          ONE_HUNDRED_PERCENT
        )
      );

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction =
    trade && realizedLPFee
      ? trade.priceImpact.subtract(realizedLPFee)
      : undefined;

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(
        priceImpactWithoutFeeFraction?.numerator,
        priceImpactWithoutFeeFraction?.denominator
      )
    : undefined;

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    CurrencyAmount.fromRawAmount(
      trade.inputAmount.currency,
      realizedLPFee.multiply(trade.inputAmount).quotient
    );

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
  };
}

export function useTradePriceSummary(data: {
  trade:
    | Trade<Currency, Currency, TradeType.EXACT_OUTPUT | TradeType.EXACT_INPUT>
    | undefined
    | null;
}) {
  const { chainId } = useWallet();

  const { trade } = data;

  const { slippageTolerance } = useTransactionSettingStore();

  const slippageAdjustedAmounts = React.useMemo(
    () => computeSlippageAdjustedAmounts(trade, slippageTolerance),
    [slippageTolerance, trade]
  );

  const { realizedLPFee } = useMemo(
    () => computeTradePriceBreakdown(trade, INPUT_FRACTION_AFTER_FEES[chainId]),
    [trade, chainId]
  );

  const { priceImpact: priceImpactPer } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined };

    const realizedLpFeePercent = computeRealizedLPFeePercent(
      trade,
      INPUT_FRACTION_AFTER_FEES[chainId]
    );
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
    return { priceImpact, realizedLPFee };
  }, [trade, chainId]);

  const receivedTitle =
    trade?.tradeType === TradeType.EXACT_INPUT
      ? "Minimum received"
      : "Maximum sent";

  const received =
    trade?.tradeType === TradeType.EXACT_INPUT
      ? slippageAdjustedAmounts["OUTPUT"]?.toSignificant(4) ?? "-"
      : slippageAdjustedAmounts["INPUT"]?.toSignificant(4) ?? "-";

  const receivedSymbol =
    trade?.tradeType === TradeType.EXACT_INPUT
      ? getTokenSymbol(trade.outputAmount.currency, chainId)
      : getTokenSymbol(trade?.inputAmount.currency, chainId);

  const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));

  const priceImpact = priceImpactPer
    ? priceImpactPer.lessThan(ONE_BIPS)
      ? "<0.01%"
      : `${priceImpactPer.multiply(-1).toFixed(2)}%`
    : "-";

  const fee = realizedLPFee
    ? `${realizedLPFee?.toSignificant(6)} ${
        trade?.inputAmount.currency.wrapped.symbol
      }`
    : "-";

  return {
    receivedTitle,
    received,
    receivedSymbol: receivedSymbol || "--",
    priceImpact,
    fee,
    route: trade?.route.path.reduce((c, t, i, a) => {
      return `${c} ${t.symbol} ${i !== a.length - 1 ? ">" : ""}`;
    }, ""),
  };
}
