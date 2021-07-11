import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ChakraProvider } from "@chakra-ui/react";
import { CSSReset } from "@chakra-ui/css-reset";
import { theme } from "./theme";
import WalletProvider from "./providers/WalletProvider";
import AppProvider from "./providers/AppProvider";
import Main from "./Main";
import { useAutoUpdateBlockNumber } from "./hooks/app";

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 10000;
  return library;
}

function Updater() {
  useAutoUpdateBlockNumber();
  return null;
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider theme={theme}>
        <WalletProvider>
          <AppProvider>
            <CSSReset />
            <Main />
            <Updater />
          </AppProvider>
        </WalletProvider>
      </ChakraProvider>
    </Web3ReactProvider>
  );
}

export default App;
