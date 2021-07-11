import React from "react";
import { Web3Provider } from "@ethersproject/providers";
import { WalletContext, WalletStatus } from "../../providers/WalletProvider";
import { chain } from "../../config";
import { BigNumber } from "ethers";

export interface UseWalletReturn {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  balance: string;
  chainId: number;
  reset: () => void;
  error: any;
  connect: (
    connector: string,
    connectType?: "erc" | "bep" | "polygon"
  ) => Promise<void>;
  status: WalletStatus;
  providerError: Error | undefined;
  ether: Web3Provider | undefined;
  rawBalance: BigNumber | undefined;
  etherSymbol: string;
}

function useWallet() {
  const { connect: connectCore, ...others } = React.useContext(WalletContext);

  const connect: (
    connector: any,
    connectType: string | number
  ) => Promise<void> = (connector: any, connectType) => {
    let chainId: number;

    if (typeof connectType === "string") {
      chainId = chain.bep;
      if (connectType === "erc") {
        chainId = chain.erc;
      }
      if (connectType === "polygon") {
        chainId = chain.polygon;
      }
    } else {
      chainId = connectType;
    }

    return connectCore(connector, chainId);
  };

  return {
    ...others,
    connect: connect,
  };
}

export default useWallet;
