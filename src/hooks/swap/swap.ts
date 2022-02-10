import React from "react";
import JSBI from "jsbi";
import { Router, SwapParameters, Trade } from "custom-uniswap-v2-sdk";
import { TransactionResponse } from "@ethersproject/providers";
import { Interface } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Currency, Percent, TradeType } from "@uniswap/sdk-core";
import { chain, etherMethods } from "../../config";
import useWallet from "../useWallet";
import UNIRouter from "../../config/abis/IUniswapV2Router02.json";
import JoeRouter from "../../config/abis/IJoeRouter02.json";
import { ROUTERS } from "../../constants/routing";
import { getTokenSymbol } from "../../utils/tokens";
import useToast from "../useToast";

function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString);
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
}

interface EstResult {
  swapParameters: SwapParameters;
  est?: BigNumber;
  err?: any;
}

function swapErrorToUserReadableMessage(error: any): string {
  let reason: string | undefined;
  while (error) {
    reason = error.reason ?? error.message ?? reason;
    error = error.error ?? error.data?.originalError;
  }

  if (reason?.indexOf("execution reverted: ") === 0)
    reason = reason.substr("execution reverted: ".length);

  switch (reason) {
    case "UniswapV2Router: EXPIRED":
      return `The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.`;
    case "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT":
    case "UniswapV2Router: EXCESSIVE_INPUT_AMOUNT":
      return `This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.`;
    case "TransferHelper: TRANSFER_FROM_FAILED":
      return `The input token cannot be transferred. There may be an issue with the input token.`;
    case "UniswapV2: TRANSFER_FAILED":
      return `The output token cannot be transferred. There may be an issue with the output token.`;
    case "UniswapV2: K":
      return `The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.`;
    case "Too little received":
    case "Too much requested":
    case "STF":
      return `This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`;
    case "TF":
      return `The output token cannot be transferred. There may be an issue with the output token. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`;
    default:
      if (reason?.indexOf("undefined is not an object") !== -1) {
        // eslint-disable-next-line no-console
        console.error(error, reason);
        return `An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`;
      }
      return `Unknown error${
        reason ? `: "${reason}"` : ""
      }. Try increasing your slippage tolerance.`;
  }
}

export function useSwap(dat: {
  trade?: Trade<Currency, Currency, TradeType> | null;
  deadline: number;
  slippageTolerance: number;
}) {
  const toast = useToast();
  const wallet = useWallet();
  const { trade, deadline, slippageTolerance } = dat;
  const [isSwapping, setSwapping] = React.useState(false);

  const handleSwap = React.useCallback(async () => {
    if (wallet.account && trade && wallet.ether) {
      try {
        setSwapping(true);
        const contract = new Contract(
          ROUTERS[wallet.chainId],
          // @todo maybe should have better way config these
          new Interface(
            wallet.chainId === chain.avax ? JoeRouter : UNIRouter.abi
          ),
          wallet.ether.getSigner()
        );

        const swapMethods: SwapParameters[] = [];

        swapMethods.push(
          Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(
              JSBI.BigInt(Math.floor(slippageTolerance)),
              JSBI.BigInt(10000)
            ),
            recipient: wallet.account,
            ttl: deadline,
            etherMethods: etherMethods[wallet.chainId],
          })
        );

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          swapMethods.push(
            Router.swapCallParameters(trade, {
              feeOnTransfer: true,
              allowedSlippage: new Percent(
                JSBI.BigInt(Math.floor(slippageTolerance)),
                JSBI.BigInt(10000)
              ),
              recipient: wallet.account,
              ttl: deadline,
              etherMethods: etherMethods[wallet.chainId],
            })
          );
        }

        const final = swapMethods.map((parameters) => ({
          parameters,
          contract,
        }));

        const est = final.map<Promise<EstResult>>((sm) => {
          return new Promise<EstResult>((resolve) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = sm;

            const options = !value || isZero(value) ? {} : { value };
            let errorMessage: string;
            contract.estimateGas[methodName](...args, options)
              .then((r) => {
                resolve({
                  swapParameters: sm.parameters,
                  est: r,
                  err: undefined,
                });
              })
              .catch((gasError) => {
                contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    // eslint-disable-next-line no-console
                    console.info(
                      "Unexpected successful call after failed estimate gas",
                      sm.parameters,
                      gasError,
                      result
                    );
                    return;
                  })
                  .catch((callError) => {
                    // eslint-disable-next-line no-console
                    console.info("Call threw error", sm.parameters, callError);
                    errorMessage = swapErrorToUserReadableMessage(callError);
                  })
                  .finally(() => {
                    resolve({
                      swapParameters: sm.parameters,
                      err: errorMessage,
                    });
                  });
              });
          });
        });

        const estCall = await Promise.all(est);

        const successEstCall = estCall.find((s) => {
          return s.err === undefined;
        });

        if (!successEstCall) {
          estCall.forEach((e) => {
            // eslint-disable-next-line no-console
            console.error(
              `Failed estimate gas for swap call "${e.swapParameters.methodName}"`,
              e.err,
              e.err.reason
            );
            toast({
              description: `Failed swap. ${e.err}`,
              status: "error",
            });
          });
          return;
        }
        const gasEstimate = successEstCall.est;
        const value = successEstCall.swapParameters.value;

        const tx: TransactionResponse = await contract[
          successEstCall.swapParameters.methodName
        ](...successEstCall.swapParameters.args, {
          gasLimit: calculateGasMargin(gasEstimate || BigNumber.from(0)),
          ...(value && !isZero(value)
            ? { value, from: wallet.account }
            : { from: wallet.account }),
        });

        await tx.wait();

        const inputSymbol = getTokenSymbol(
          trade.inputAmount.currency,
          wallet.chainId
        );
        const outputSymbol = getTokenSymbol(
          trade.outputAmount.currency,
          wallet.chainId
        );
        const inputAmount = trade.inputAmount.toSignificant(3);
        const outputAmount = trade.outputAmount.toSignificant(3);

        const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
        toast({
          description: base,
          status: "success",
        });
      } catch (e) {
        if (e?.code === 4001) {
          toast({
            description: "Transaction rejected.",
            status: "info",
          });
        } else {
          // eslint-disable-next-line no-console
          console.error(`Critical error when swap`, e, e.reason);
          toast({
            description:
              "Failed swap. Please try to adjust slippage tolerance or try again later.",
            status: "error",
          });
        }
      } finally {
        setSwapping(false);
      }
    }
  }, [
    wallet.account,
    wallet.ether,
    wallet.chainId,
    trade,
    slippageTolerance,
    deadline,
    toast,
  ]);

  return {
    handleSwap,
    isSwapping,
  };
}
