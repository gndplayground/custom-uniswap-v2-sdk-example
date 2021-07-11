import { selectBlockNumber, useAppStore } from "./app";
import useWallet from "../../hooks/useWallet";

export function useBlockNumber() {
  const wallet = useWallet();
  return useAppStore(selectBlockNumber(wallet.chainId || 0));
}
