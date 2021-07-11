import { Currency, CurrencyAmount, Token } from "@uniswap/sdk-core";
import flatMap from "lodash.flatmap";
import { Contract } from "@ethersproject/contracts";
import { computePairAddress, Pair } from "custom-uniswap-v2-sdk";
import IUniswapV2PairABI from "../../config/abis/IUniswapV2Pair.json";
import React, { useMemo } from "react";
import useWallet from "../useWallet";
import {
  ADDITIONAL_BASES,
  BASES_TO_CHECK_TRADES_AGAINST,
  CUSTOM_BASES,
  FEES_DENOMINATORS,
  FEES_NUMERATORS,
} from "../../constants/routing";
import { FACTORY_ADDRESSES, INIT_CODE_HASHES } from "../../constants/factory";
import { Interface } from "ethers/lib/utils";
import useIsWindowVisible from "../window";

export function useAllCurrencyCombinations(
  currencyA?: Currency,
  currencyB?: Currency
): [Token, Token][] {
  const { chainId } = useWallet();

  const [tokenA, tokenB] = chainId
    ? [currencyA?.wrapped, currencyB?.wrapped]
    : [undefined, undefined];

  const bases: Token[] = useMemo(() => {
    if (!chainId) return [];

    const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [];
    const additionalA = tokenA
      ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? []
      : [];
    const additionalB = tokenB
      ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? []
      : [];

    return [...common, ...additionalA, ...additionalB];
  }, [chainId, tokenA, tokenB]);

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] =>
        bases.map((otherBase) => [base, otherBase])
      ),
    [bases]
  );

  return useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] =>
              Boolean(tokens[0] && tokens[1])
            )
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true;
              const customBases = CUSTOM_BASES[chainId];

              const customBasesA: Token[] | undefined =
                customBases?.[tokenA.address];
              const customBasesB: Token[] | undefined =
                customBases?.[tokenB.address];

              if (!customBasesA && !customBasesB) return true;

              if (
                customBasesA &&
                !customBasesA.find((base) => tokenB.equals(base))
              )
                return false;
              if (
                customBasesB &&
                !customBasesB.find((base) => tokenA.equals(base))
              )
                return false;

              return true;
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  );
}

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI.abi);

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(
  currencies: [Currency | undefined, Currency | undefined][]
) {
  const windowVisible = useIsWindowVisible();
  const [result, setResult] = React.useState<[PairState, null | Pair][]>([]);

  const { ether } = useWallet();

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        currencyA?.wrapped,
        currencyB?.wrapped,
      ]),
    [currencies]
  );

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA &&
          tokenB &&
          tokenA.chainId === tokenB.chainId &&
          !tokenA.equals(tokenB) &&
          FACTORY_ADDRESSES[tokenA.chainId] &&
          INIT_CODE_HASHES[tokenA.chainId]
          ? computePairAddress({
              initCodeHash: INIT_CODE_HASHES[tokenA.chainId],
              factoryAddress: FACTORY_ADDRESSES[tokenA.chainId],
              tokenA,
              tokenB,
            })
          : undefined;
      }),
    [tokens]
  );

  const getData: () => Promise<[PairState, null | Pair][]> =
    React.useCallback(async () => {
      const allPromise = pairAddresses.map((pa) => {
        return new Promise((resolve) => {
          if (pa && ether) {
            const contract = new Contract(pa, PAIR_INTERFACE, ether);
            contract
              ?.getReserves()
              .then((r: any) => {
                resolve(r);
              })
              .catch(() => {
                resolve(undefined);
              });
          } else {
            resolve(undefined);
          }
        });
      });

      const r = await Promise.all(allPromise);

      return r.map((result: any, i) => {
        const tokenA = tokens[i][0];
        const tokenB = tokens[i][1];

        if (!tokenA || !tokenB || tokenA.equals(tokenB))
          return [PairState.INVALID, null];
        if (!result) return [PairState.NOT_EXISTS, null];

        const fc = FACTORY_ADDRESSES[tokenA.chainId];
        const hash = INIT_CODE_HASHES[tokenA.chainId];

        const { reserve0, reserve1 } = result;

        const [token0, token1] = tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA];
        return [
          PairState.EXISTS,
          new Pair(
            CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
            CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
            fc,
            hash,
            FEES_NUMERATORS[tokenA.chainId],
            FEES_DENOMINATORS[tokenA.chainId]
          ),
        ];
      });
    }, [ether, pairAddresses, tokens]);

  React.useEffect(() => {
    if (windowVisible) {
      getData()
        .then((r) => {
          setResult(r);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.log("Failed get pairs", e);
        });
    }
  }, [getData, windowVisible]);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (windowVisible) {
      interval = setInterval(() => {
        getData()
          .then((r) => {
            setResult(r);
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log("Failed get pairs", e);
          });
      }, 8000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [getData, windowVisible]);

  return result;
}

export function useAllCommonPairs(
  currencyA?: Currency,
  currencyB?: Currency
): Pair[] {
  const allCurrencyCombinations = useAllCurrencyCombinations(
    currencyA,
    currencyB
  );

  const allPairs = usePairs(allCurrencyCombinations);

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] =>
            Boolean(result[0] === PairState.EXISTS && result[1])
          )
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] =
              memo[curr.liquidityToken.address] ?? curr;
            return memo;
          }, {})
      ),
    [allPairs]
  );
}
