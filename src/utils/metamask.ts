import { chain } from "../config";

export function isMetamask(): boolean {
  return (window as any).ethereum && (window as any).ethereum.isMetaMask;
}

export function getMetamaskChain() {
  if (isMetamask()) {
    return parseInt((window as any).ethereum.chainId);
  }
  return -1;
}

export async function addChainBSC() {
  const provider = (window as any).ethereum;
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${chain.bep.toString(16)}`,
        chainName: "Binance Smart Chain Mainnet",
        nativeCurrency: {
          name: "BNB",
          symbol: "bnb",
          decimals: 18,
        },
        rpcUrls: ["https://bsc-dataseed.binance.org"],
        blockExplorerUrls: ["https://bscscan.com/"],
      },
    ],
  });
}

export async function addChainMatic() {
  const provider = (window as any).ethereum;
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${chain.polygon.toString(16)}`,
        chainName: "Polygon POS",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com"],
      },
    ],
  });
}

export async function addChainAvax() {
  const provider = (window as any).ethereum;
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${chain.avax.toString(16)}`,
        chainName: "Avalanche Network",
        nativeCurrency: {
          name: "Avalanche",
          symbol: "AVAX",
          decimals: 18,
        },
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
        blockExplorerUrls: ["https://snowtrace.io"],
      },
    ],
  });
}
