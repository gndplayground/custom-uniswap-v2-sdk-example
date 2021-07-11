import create from "zustand";

export type AppStore = {
  blockNumber: { [chainId: number]: number };
  setBlockNumber: (chainId: number, block: number) => void;
};

const useAppStore = create<AppStore>((set) => ({
  blockNumber: {},
  setBlockNumber: (chainId: number, block: number) =>
    set((state) => ({
      blockNumber: {
        ...state.blockNumber,
        [chainId]: block,
      },
    })),
}));

function selectBlockNumber(chainId: number): (state: AppStore) => number {
  return (state: AppStore) => {
    return state.blockNumber[chainId] ?? 0;
  };
}

function selectBlockUpdater(state: AppStore) {
  return state.setBlockNumber;
}

export { useAppStore, selectBlockNumber, selectBlockUpdater };
