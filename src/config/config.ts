import { EtherMethods } from "custom-uniswap-v2-sdk";

export interface Config {
  BSC_RPC_URL: string;
  POLYGON_RPC_URL: string;
  AVAX_RPC_URL: string;
  PANCAKE_ROUTER: string;
  QUICK_SWAP_ROUTER: string;
  TRADER_JOE_ROUTER: string;
  PANCAKE_CODE_HASH: string;
  QUICK_SWAP_CODE_HASH: string;
  TRADER_JOE_CODE_HASH: string;
  PUBLIC_URL: string;
}

const config: Config = {
  BSC_RPC_URL: process.env.REACT_APP_BSC_RPC_URL as string,
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL as string,
  AVAX_RPC_URL: process.env.REACT_APP_AVAX_RPC_URL as string,
  PANCAKE_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  QUICK_SWAP_ROUTER: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  TRADER_JOE_ROUTER: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
  PANCAKE_CODE_HASH:
    "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5",
  QUICK_SWAP_CODE_HASH:
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
  TRADER_JOE_CODE_HASH:
    "0x0bbca9af0511ad1a1da383135cf3a8d2ac620e549ef9f6ae3a4c33c2fed0af91",
  PUBLIC_URL: process.env.PUBLIC_URL + "/" || "/",
};

const localStorageKey = {
  lastWallet: "lastWallet",
  lastChainId: "lastChainId",
  transactionSetting: "transactionSetting",
};

const erc = parseInt(process.env.REACT_APP_ERC_CHAIN || "1", 10);
const bep = parseInt(process.env.REACT_APP_BEP_CHAIN || "56", 10);
const polygon = parseInt(process.env.REACT_APP_POLYGON_CHAIN || "137", 10);
const avax = parseInt(process.env.REACT_APP_AVAX_RPC_URL || "43114", 10);

const chain = {
  erc: isNaN(erc) ? 1 : erc,
  bep: isNaN(bep) ? 56 : bep,
  polygon: isNaN(polygon) ? 137 : polygon,
  avax: isNaN(avax) ? 43114 : avax,
};

const etherMethods: { [key: string]: EtherMethods } = {
  [chain.avax]: {
    swapETHForExactTokens: "swapAVAXForExactTokens",
    swapExactETHForTokens: "swapExactAVAXForTokens",
    swapExactETHForTokensSupportingFeeOnTransferTokens:
      "swapExactAVAXForTokensSupportingFeeOnTransferTokens",
    swapExactTokensForETH: "swapExactTokensForAVAX",
    swapExactTokensForETHSupportingFeeOnTransferTokens:
      "swapExactTokensForAVAXSupportingFeeOnTransferTokens",
    swapTokensForExactETH: "swapTokensForExactAVAX",
  },
};

export { config, localStorageKey, chain, etherMethods };
