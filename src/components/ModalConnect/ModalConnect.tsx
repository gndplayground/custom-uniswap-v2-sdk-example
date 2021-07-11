import React from "react";
import Box from "../Box";
import Modal from "../Modal";
import Close from "../../icons/Close";
import { chain } from "../../config";

export interface ModalConnectProps {
  currentChainId?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onConnect?: (t: string, chain: number) => void;
}

const networks = [
  {
    name: "Binance Chain",
    icon: "/images/icon/bsc-wallet.svg",
    chainId: chain.bep,
  },
  {
    name: "Polygon",
    icon: "/images/icon/polygon-white.svg",
    chainId: chain.polygon,
  },
];

const wallets = {
  [chain.polygon]: [
    {
      name: "Metamask",
      icon: "/images/icon/metamask-fox.svg",
      connector: "injected",
    },
  ],
  [chain.bep]: [
    {
      name: "Metamask",
      icon: "/images/icon/metamask-fox.svg",
      connector: "injected",
    },
    {
      name: "Binance Chain Wallet",
      icon: "/images/icon/bsc-wallet.svg",
      connector: "bsc",
    },
    {
      name: "Wallet Connect",
      icon: "/images/icon/wallet-connect.png",
      connector: "walletconnect",
    },
  ],
};

function ModalConnect(props: ModalConnectProps) {
  const { isOpen, onClose, onConnect, currentChainId = chain.bep } = props;

  const [selectedChainId, setSelectChainId] = React.useState(currentChainId);

  function handleConnect(connector: string, chain: number) {
    return () => {
      if (onConnect) {
        onConnect(connector, chain);
      }
    };
  }

  function handleSelectChain(chain: number) {
    return () => {
      if (onConnect) {
        setSelectChainId(chain);
      }
    };
  }

  return (
    <Modal
      isOpen={isOpen}
      modalContentProps={{
        maxWidth: "700px",
      }}
    >
      <Box
        borderTopLeftRadius="24px"
        borderTopRightRadius="24px"
        px="30px"
        position="relative"
        as="header"
        bg="#61D9FA"
        minHeight="70px"
        display="flex"
        alignItems="center"
      >
        <Box
          fontSize="24px"
          lineHeight="28px"
          color="#0D285A"
          as="h2"
          fontWeight={700}
        >
          Connect your wallet
        </Box>
        <Box
          onClick={onClose}
          ml="auto"
          as="button"
          color="#212B54"
          fontSize="20px"
        >
          <Close />
        </Box>
      </Box>
      <Box
        bg="#1C264E"
        borderBottomRightRadius="24px"
        borderBottomLeftRadius="24px"
      >
        <Box as="section">
          <Box
            mt="10px"
            color="primary"
            as="h3"
            fontWeight="bold"
            fontSize="20px"
            textAlign="center"
          >
            Select network
          </Box>
          <Box
            mt="16px"
            display={{ xl: "flex", base: "flex" }}
            flexWrap="wrap"
            justifyContent="center"
          >
            {networks.map((w) => {
              return (
                <Box
                  width={{
                    base: "50%",
                    xl: "25%",
                  }}
                  key={w.name}
                  color="#9CAFF1"
                >
                  <Box
                    border={w.chainId === selectedChainId ? "1px solid" : ""}
                    py="20px"
                    px="30px"
                    width="100%"
                    outline="none"
                    textAlign="center"
                    as="button"
                    fontSize="16px"
                    fontWeight={700}
                    onClick={handleSelectChain(w.chainId)}
                  >
                    <Box
                      mx="auto"
                      as="img"
                      alt={`${w.name} icon`}
                      src={w.icon}
                      w="60px"
                      h="60px"
                    />
                    <Box mt="8px" as="span" display="block">
                      {w.name}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box as="section" mt="24px">
          <Box
            mt="10px"
            color="primary"
            as="h3"
            fontWeight="bold"
            fontSize="20px"
            textAlign="center"
          >
            Select wallet
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            {wallets[selectedChainId]?.map((w) => {
              return (
                <Box
                  width={{
                    base: "50%",
                    xl: "25%",
                  }}
                  py="20px"
                  px="30px"
                  as="button"
                  key={w.name}
                  color="#9CAFF1"
                >
                  <Box
                    width="100%"
                    outline="none"
                    textAlign="center"
                    fontSize="16px"
                    fontWeight={700}
                    onClick={handleConnect(w.connector, selectedChainId)}
                  >
                    <Box
                      mx="auto"
                      as="img"
                      alt={`${w.name} icon`}
                      src={w.icon}
                      w="50px"
                      h="50px"
                    />
                    <Box mt="8px" as="span" display="block">
                      {w.name}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalConnect;
