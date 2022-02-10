import { Token } from "@uniswap/sdk-core";
import { config } from "../config";
import { BASE_TOKENS, WETH9_EXTENDED } from "./tokens";
import { SupportedChainId } from "./chain";
import JSBI from "jsbi";

export const ROUTERS: { [chainId: number]: string } = {
  [SupportedChainId.BSC]: config.PANCAKE_ROUTER,
  [SupportedChainId.MATIC]: config.QUICK_SWAP_ROUTER,
  [SupportedChainId.AVAX]: config.TRADER_JOE_ROUTER,
};

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

const WETH_ONLY: ChainTokenList = {
  [SupportedChainId.MATIC]: [WETH9_EXTENDED[SupportedChainId.MATIC]],
  [SupportedChainId.BSC]: [WETH9_EXTENDED[SupportedChainId.BSC]],
  [SupportedChainId.AVAX]: [WETH9_EXTENDED[SupportedChainId.AVAX]],
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
  [SupportedChainId.AVAX]: [
    ...WETH_ONLY[SupportedChainId.AVAX],
    BASE_TOKENS[SupportedChainId.AVAX].JOE,
    BASE_TOKENS[SupportedChainId.AVAX].PNG,
    BASE_TOKENS[SupportedChainId.AVAX].USDTe,
    BASE_TOKENS[SupportedChainId.AVAX].DAIe,
    BASE_TOKENS[SupportedChainId.AVAX].USDCe,
  ],
};

export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {
  [SupportedChainId.BSC]: {},
  [SupportedChainId.MATIC]: {},
  [SupportedChainId.AVAX]: {},
};

export const CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {
  [SupportedChainId.BSC]: {},
  [SupportedChainId.MATIC]: {},
  [SupportedChainId.AVAX]: {},
};

export const FEES_NUMERATORS: {
  [chainId: number]: JSBI;
} = {
  [SupportedChainId.BSC]: JSBI.BigInt(9975),
  [SupportedChainId.MATIC]: JSBI.BigInt(997),
  [SupportedChainId.AVAX]: JSBI.BigInt(997),
};

export const FEES_DENOMINATORS: {
  [chainId: number]: JSBI;
} = {
  [SupportedChainId.BSC]: JSBI.BigInt(10000),
  [SupportedChainId.MATIC]: JSBI.BigInt(1000),
  [SupportedChainId.AVAX]: JSBI.BigInt(1000),
};
