import { Currency, CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Contract } from "@ethersproject/contracts";
import { Interface } from "@ethersproject/abi";
import { Signer } from "@ethersproject/abstract-signer";
import { Provider } from "@ethersproject/abstract-provider";
import JSBI from "jsbi";
import React from "react";
import ERC20 from "../../config/abis/erc20.json";

export function useTokenBalances(
  address?: string,
  tokens?: (Token | Currency | undefined)[],
  provider?: Signer | Provider
) {
  const [amounts, setAmount] = React.useState<{
    [address: string]: CurrencyAmount<Token>;
  }>({});

  const update = React.useCallback(() => {
    if (address && tokens && provider) {
      const operations: Promise<{
        address: string;
        amount: CurrencyAmount<Token>;
      }>[] = [];
      tokens.forEach((t) => {
        if (t && t.isToken) {
          operations.push(
            new Promise((resolve, reject) => {
              const contract = new Contract(
                t.address,
                new Interface(ERC20),
                provider
              );
              if (!contract.balanceOf) {
                resolve({
                  address: t.address,
                  amount: CurrencyAmount.fromRawAmount(t, 0),
                });
              } else {
                contract
                  .balanceOf(address)
                  .then((r: string) => {
                    resolve({
                      address: t.address,
                      amount: CurrencyAmount.fromRawAmount(
                        t,
                        JSBI.BigInt(r.toString())
                      ),
                    });
                  })
                  .catch((e: any) => {
                    reject(e);
                  });
              }
            })
          );
        }
      });

      Promise.all(operations)
        .then((r) => {
          setAmount(
            r.reduce<{ [key: string]: CurrencyAmount<Token> }>((rt, c) => {
              rt[c.address] = c.amount;
              return rt;
            }, {})
          );
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error("Failed get balance " + e);
        });
    }
  }, [address, provider, tokens]);

  React.useEffect(() => {
    update();

    const timer = setInterval(() => {
      update();
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [update, tokens]);

  return {
    amounts,
    update,
  };
}
