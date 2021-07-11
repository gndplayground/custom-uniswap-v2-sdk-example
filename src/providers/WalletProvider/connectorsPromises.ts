import { AbstractConnector } from "@web3-react/abstract-connector";

export const injected: (chainId: number) => Promise<AbstractConnector> = (
  chainId
) => {
  return new Promise((resolve) => {
    import("@web3-react/injected-connector").then((all) => {
      const connector = new all.InjectedConnector({
        supportedChainIds: [chainId],
      });
      resolve(connector);
    });
  });
};

export const bsc: (chainId: number) => Promise<AbstractConnector> = (
  chainId
) => {
  return new Promise((resolve) => {
    import("@binance-chain/bsc-connector").then((all) => {
      const connector = new all.BscConnector({ supportedChainIds: [chainId] });
      resolve(connector);
    });
  });
};
