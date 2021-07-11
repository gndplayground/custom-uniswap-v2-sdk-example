import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { Contract } from "@ethersproject/contracts";
import React, { useMemo } from "react";
import useWallet from "../useWallet";
import { tryParseAmount } from "./trade";
import { WETH9_EXTENDED, ETHER_TOKEN_LIST } from "../../constants/tokens";
import { useTokenBalances } from "../wallet";
import WETH_ABI from "../../config/abis/weth.json";
import useToast from "../useToast";

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE };
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
): {
  wrapType: WrapType;
  execute?: undefined | (() => Promise<void>);
  inputError?: string;
  isExecuting?: boolean;
} {
  const { chainId, account, rawBalance, ether } = useWallet();

  const toast = useToast();

  const [isExecuting, setExecuting] = React.useState(false);

  const balances = useTokenBalances(
    account ?? undefined,
    React.useMemo(() => {
      return [inputCurrency];
    }, [inputCurrency]),
    ether
  );

  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(
    () => tryParseAmount(typedValue, inputCurrency),
    [inputCurrency, typedValue]
  );

  const balance = useMemo(() => {
    if (inputCurrency && rawBalance && inputCurrency.isNative) {
      return CurrencyAmount.fromRawAmount(
        inputCurrency,
        JSBI.BigInt(rawBalance)
      );
    }

    if (inputCurrency && !inputCurrency.isNative) {
      return balances.amounts[inputCurrency.address];
    }
  }, [balances.amounts, inputCurrency, rawBalance]);

  return useMemo(() => {
    if (!chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE;
    const weth = WETH9_EXTENDED[chainId];
    const eth = ETHER_TOKEN_LIST[chainId];

    if (!weth) return NOT_APPLICABLE;

    const hasInputAmount = Boolean(inputAmount?.greaterThan("0"));

    const sufficientBalance =
      inputAmount && balance && !balance.lessThan(inputAmount);

    const firstNativeSecondWETH =
      inputCurrency.isNative && weth.equals(outputCurrency);

    const firstWETHSecondNative =
      weth.equals(inputCurrency) && outputCurrency.isNative;

    async function execute() {
      if (
        !chainId ||
        !inputCurrency ||
        !outputCurrency ||
        !inputAmount ||
        !(firstWETHSecondNative || firstNativeSecondWETH)
      )
        return;

      try {
        setExecuting(true);
        let tx;
        let mess;

        const wethContract = new Contract(
          weth.address,
          WETH_ABI,
          ether?.getSigner()
        );

        if (firstNativeSecondWETH) {
          mess = `Wrap ${inputAmount.toSignificant(6)} ${eth.symbol} to ${
            outputCurrency.symbol
          }`;
          tx = await wethContract.deposit({
            value: `0x${inputAmount.quotient.toString(16)}`,
          });
        } else if (firstWETHSecondNative) {
          mess = `Wrap ${inputAmount.toSignificant(6)} ${
            inputCurrency.symbol
          } to ${eth.symbol}`;
          tx = await wethContract.withdraw(
            `0x${inputAmount.quotient.toString(16)}`
          );
        }

        await tx.wait();

        toast({
          description: mess,
          status: "success",
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        toast({
          description: "Failed wrap or unwrap",
          status: "error",
        });
      } finally {
        setExecuting(false);
      }
    }

    if (firstNativeSecondWETH || firstWETHSecondNative) {
      let inputError: string | undefined;

      if (firstNativeSecondWETH) {
        inputError = sufficientBalance
          ? undefined
          : hasInputAmount
          ? `Insufficient ${eth.symbol} balance`
          : `Enter ${eth.symbol} amount`;
      }

      if (firstWETHSecondNative) {
        inputError = sufficientBalance
          ? undefined
          : hasInputAmount
          ? `Insufficient ${weth.symbol} balance`
          : `Enter ${weth.symbol} amount`;
      }

      return {
        wrapType: firstNativeSecondWETH ? WrapType.WRAP : WrapType.UNWRAP,
        execute,
        inputError,
        isExecuting,
      };
    } else {
      return NOT_APPLICABLE;
    }
  }, [
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    ether,
    toast,
    isExecuting,
  ]);
}
