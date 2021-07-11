import { Token } from "@uniswap/sdk-core";
import { BASE_TOKENS, WETH9_EXTENDED } from "./tokens";
import { SupportedChainId } from "./chain";
import JSBI from "jsbi";

export const ROUTERS: { [chainId: number]: string } = {
  [SupportedChainId.BSC]: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  [SupportedChainId.MATIC]: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

const WETH_ONLY: ChainTokenList = {
  [SupportedChainId.MATIC]: [WETH9_EXTENDED[SupportedChainId.MATIC]],
  [SupportedChainId.BSC]: [WETH9_EXTENDED[SupportedChainId.BSC]],
};

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [SupportedChainId.BSC]: [
    ...WETH_ONLY[SupportedChainId.BSC],
    BASE_TOKENS[SupportedChainId.BSC].CAKE,
    BASE_TOKENS[SupportedChainId.BSC].BUSD,
    BASE_TOKENS[SupportedChainId.BSC].USDT,
    BASE_TOKENS[SupportedChainId.BSC].BTCB,
    BASE_TOKENS[SupportedChainId.BSC].UST,
    BASE_TOKENS[SupportedChainId.BSC].ETH,
  ],
  [SupportedChainId.MATIC]: [
    ...WETH_ONLY[SupportedChainId.MATIC],
    BASE_TOKENS[SupportedChainId.MATIC].USDC,
    BASE_TOKENS[SupportedChainId.MATIC].USDT,
    BASE_TOKENS[SupportedChainId.MATIC].QUICK,
    BASE_TOKENS[SupportedChainId.MATIC].ETHER,
    BASE_TOKENS[SupportedChainId.MATIC].WBTC,
    BASE_TOKENS[SupportedChainId.MATIC].DAI,
    BASE_TOKENS[SupportedChainId.MATIC].MAUSDC,
  ],
};

export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {
  [SupportedChainId.BSC]: {},
  [SupportedChainId.MATIC]: {},
};

export const CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {
  [SupportedChainId.BSC]: {},
  [SupportedChainId.MATIC]: {},
};

export const FEES_NUMERATORS: {
  [chainId: number]: JSBI;
} = {
  [SupportedChainId.BSC]: JSBI.BigInt(9975),
  [SupportedChainId.MATIC]: JSBI.BigInt(997),
};

export const FEES_DENOMINATORS: {
  [chainId: number]: JSBI;
} = {
  [SupportedChainId.BSC]: JSBI.BigInt(10000),
  [SupportedChainId.MATIC]: JSBI.BigInt(1000),
};
