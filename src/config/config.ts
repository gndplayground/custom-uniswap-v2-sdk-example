export interface Config {
  BSC_RPC_URL: string;
  POLYGON_RPC_URL: string;
  PANCAKE_ROUTER: string;
  QUICK_SWAP_ROUTER: string;
  PANCAKE_CODE_HASH: string;
  QUICK_SWAP_CODE_HASH: string;
}

const config: Config = {
  BSC_RPC_URL: process.env.REACT_APP_BSC_RPC_URL as string,
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL as string,
  PANCAKE_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  QUICK_SWAP_ROUTER: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  PANCAKE_CODE_HASH:
    "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5",
  QUICK_SWAP_CODE_HASH:
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
};

const localStorageKey = {
  lastWallet: "lastWallet",
  lastChainId: "lastChainId",
  transactionSetting: "transactionSetting",
};

const erc = parseInt(process.env.REACT_APP_ERC_CHAIN || "1", 10);
const bep = parseInt(process.env.REACT_APP_BEP_CHAIN || "56", 10);
const polygon = parseInt(process.env.REACT_APP_POLYGON_CHAIN || "137", 10);

const chain = {
  erc: isNaN(erc) ? 1 : erc,
  bep: isNaN(bep) ? 56 : bep,
  polygon: isNaN(polygon) ? 137 : polygon,
};

export { config, localStorageKey, chain };
