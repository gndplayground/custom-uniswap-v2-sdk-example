import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Box } from "../Box";
import Modal from "../Modal";
import { chain, localStorageKey } from "../../config";
import Close from "../../icons/Close";
import useWallet from "../../hooks/useWallet";
import ButtonCore from "../ButtonCore";

export interface ModalAccountProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function ModalAccount(props: ModalAccountProps) {
  const { isOpen, onClose } = props;
  const wallet = useWallet();
  const [isCopied, setIsCopied] = React.useState(false);

  function handleDisconnect() {
    wallet.reset();
    localStorage.removeItem(localStorageKey.lastWallet);
    localStorage.removeItem(localStorageKey.lastChainId);
    onClose && onClose();
  }

  if (!wallet.account) {
    return null;
  }

  function getScanUrl() {
    if (wallet.chainId === chain.bep) {
      return `https://bscscan.com/address/${wallet.account}`;
    }
    return `https://etherscan.io/address/${wallet.account}`;
  }

  return (
    <Modal
      isOpen={isOpen}
      modalContentProps={{
        maxWidth: "600px",
      }}
    >
      <Box
        borderRadius="30px"
        color="#fff"
        bg="#212B54"
        maxWidth="600px"
        width="100%"
        minHeight="300px"
        py={{ base: "24px", xl: "40px" }}
        px={{
          base: "16px",
          lg: "40px",
        }}
      >
        <Box as="header" display="flex" alignItems="center">
          <Box
            as="h2"
            fontSize={{ base: "16px", xl: "24px" }}
            lineHeight="35px"
            fontWeight={700}
          >
            Your Wallet
          </Box>
          <Box
            as="button"
            ml="auto"
            color="#61D9FA"
            fontSize={{ base: "18px", xl: "22px" }}
            onClick={onClose}
          >
            <Close />
          </Box>
        </Box>
        <Box
          as="p"
          mt="60px"
          fontSize={{ base: "14px", xl: "18px" }}
          color="#0DE6FF"
          textAlign="center"
        >
          {wallet.account}
        </Box>
        <Box mt="20px" display="flex" justifyContent="center">
          <Box
            display="flex"
            alignItems="center"
            mr="60px"
            as="a"
            target="_blank"
            rel="noopener noreferrer"
            href={getScanUrl()}
          >
            <Box
              mr="12px"
              as="img"
              src="/images/icon/external-link.svg"
              alt=""
            />
            View in explorer
          </Box>
          <CopyToClipboard
            text={wallet.account}
            onCopy={() => {
              setIsCopied(true);
            }}
          >
            <Box as="button" display="flex" alignItems="center">
              <Box mr="12px" as="img" src="/images/icon/copy.svg" alt="" />
              Copy address
            </Box>
          </CopyToClipboard>
        </Box>
        <Box as="p" textAlign="center" mt="20px" color="#61D9FA">
          {isCopied && <p>Copied address!</p>}
        </Box>
        <Box mt="70px" display="flex" justifyContent="center">
          <ButtonCore
            width="80%"
            maxWidth="300px"
            as="button"
            onClick={handleDisconnect}
          >
            Logout
          </ButtonCore>
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalAccount;
