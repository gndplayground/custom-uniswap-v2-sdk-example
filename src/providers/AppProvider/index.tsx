import React from "react";
import useToggle from "../../hooks/useToogle";
import ModalConnect from "../../components/ModalConnect";
import useWallet from "../../hooks/useWallet";
import { localStorageKey } from "../../config";

export interface AppContextValue {
  isOpenConnect?: boolean;
  toggleOpenConnect: (state?: boolean) => void;
}

export const AppContext = React.createContext<AppContextValue>({} as any);

export default function AppProvider(props: { children?: React.ReactNode }) {
  const toggleConnect = useToggle(false);
  const wallet = useWallet();
  const { children } = props;

  function handleConnect(t: string, chain: number) {
    wallet.connect(t, chain).then(() => {
      localStorage.setItem(localStorageKey.lastWallet, t);
      localStorage.setItem(localStorageKey.lastChainId, chain.toString());
      toggleConnect.setInActive();
    });
  }

  return (
    <AppContext.Provider
      value={{
        isOpenConnect: toggleConnect.active,
        toggleOpenConnect: toggleConnect.toggle,
      }}
    >
      {children}
      <ModalConnect
        currentChainId={wallet.chainId}
        onConnect={handleConnect}
        onClose={toggleConnect.toggle}
        isOpen={toggleConnect.active}
      />
    </AppContext.Provider>
  );
}
