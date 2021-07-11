import React from "react";
import useWallet from "../../hooks/useWallet";
import Header from "../../components/Header";
import AppContainer from "../../components/AppContainer";
import Box from "../../components/Box";
import SwapBoard from "./components/SwapBoard";
import { SupportedChainId } from "../../constants/chain";
import { config } from "../../config";

const logos: { [chainId: number]: string } = {
  [SupportedChainId.BSC]: `${config.PUBLIC_URL}images/icon/bsc-wallet.svg`,
  [SupportedChainId.MATIC]: `${config.PUBLIC_URL}images/icon/polygon-white.svg`,
};

function Home() {
  const wallet = useWallet();

  return (
    <div>
      <Header />
      <Box as="section" pt="50px">
        <AppContainer>
          <Box maxWidth="700px" mx="auto" px="16px">
            <Box as="p">
              This website was built to give an example with the package{" "}
              <Box
                textDecoration="underline"
                as="a"
                href="https://github.com/gndplayground/uniswap-v2-sdk"
              >
                custom-uniswap-v2-sdk
              </Box>
              .
            </Box>
            <Box as="p">
              You can find the source code{" "}
              <Box
                textDecoration="underline"
                as="a"
                href="https://github.com/gndplayground/custom-uniswap-v2-sdk-example"
              >
                here
              </Box>
              .
            </Box>
            <Box as="p">
              The website uses <strong>PancakeSwap</strong> and{" "}
              <strong>QuickSwap</strong> liquidity pools to give an example
              token swapping. <br /> Because the website is used for demo
              purposes so the code might not always stay updated with the
              development of both platforms. Use with caution..
            </Box>
          </Box>

          <Box
            mt="16px"
            display="flex"
            justifyContent="center"
            as="h1"
            fontSize="32px"
            fontWeight="bold"
          >
            Swap{" "}
            <Box ml="8px" width="40px" as="img" src={logos[wallet.chainId]} />
          </Box>
          <Box mt="32px" maxWidth="500px" mx="auto">
            <SwapBoard />
          </Box>
        </AppContainer>
      </Box>
    </div>
  );
}

export default Home;
