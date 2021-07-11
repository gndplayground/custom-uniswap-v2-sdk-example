import create from "zustand";
import { localStorageKey } from "../config";

export type TransactionSetting = {
  deadline: number;
  slippageTolerance: number;
  setDeadline: (by: number) => void;
  setSlippageTolerance: (by: number) => void;
};

const defaultSetting = {
  deadline: 1200,
  slippageTolerance: 50,
};

try {
  const raw = localStorage.getItem(localStorageKey.transactionSetting);
  if (raw) {
    const data = JSON.parse(raw ?? "");
    defaultSetting.deadline = data.deadline;
    defaultSetting.slippageTolerance = data.slippageTolerance;
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.log("Parse transaction setting fail");
}

const useTransactionSettingStore = create<TransactionSetting>((set) => ({
  ...defaultSetting,
  setDeadline: (by) =>
    set((state) => {
      return {
        ...state,
        deadline: by,
      };
    }),
  setSlippageTolerance: (by) =>
    set((state) => {
      return {
        ...state,
        slippageTolerance: by,
      };
    }),
}));

useTransactionSettingStore.subscribe(
  (a) => {
    localStorage.setItem(localStorageKey.transactionSetting, JSON.stringify(a));
  },
  (state) => {
    return {
      deadline: state.deadline,
      slippageTolerance: state.slippageTolerance,
    };
  }
);

export const transactionSettingSelectors = {
  deadline: (state: TransactionSetting) => state.deadline,
  slippageTolerance: (state: TransactionSetting) => state.slippageTolerance,
};

export { useTransactionSettingStore };
