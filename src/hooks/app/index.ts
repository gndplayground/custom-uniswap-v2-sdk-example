import useIsWindowVisible from "../window";
import useWallet from "../useWallet";
import React from "react";
import {
  selectBlockNumber,
  selectBlockUpdater,
  useAppStore,
} from "../../stores/app";
import useDebounceValue from "../useDebounceValue";

export function useAutoUpdateBlockNumber() {
  const windowVisible = useIsWindowVisible();
  const [state, setState] = React.useState<number>(0);
  const updateBlock = useAppStore(selectBlockUpdater);

  const { ether, chainId } = useWallet();

  const debouncedState = useDebounceValue(state, 100);

  React.useEffect(() => {
    if (chainId) {
      updateBlock(chainId, debouncedState);
    }
  }, [debouncedState, chainId, updateBlock]);

  React.useEffect(() => {
    function blockNumberCallback(blockNumber: number) {
      setState(blockNumber);
    }

    if (windowVisible && ether) {
      ether
        .getBlockNumber()
        .then(blockNumberCallback)
        .catch((error) =>
          // eslint-disable-next-line no-console
          console.error(
            `Failed to get block number for chainId: ${chainId}`,
            error
          )
        );

      ether.on("block", blockNumberCallback);
    }
    return () => {
      if (ether) {
        ether.removeListener("block", blockNumberCallback);
      }
    };
  }, [ether, chainId, windowVisible, updateBlock]);
}

export function useBlockNumberCallback(cb: () => void) {
  const { chainId } = useWallet();

  const block = useAppStore(selectBlockNumber(chainId || 0));

  React.useEffect(() => {
    cb();
  }, [block, cb]);
}
