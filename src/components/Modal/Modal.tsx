import React from "react";
import {
  Modal as ModalCore,
  ModalOverlay,
  ModalContent,
} from "@chakra-ui/modal";
import { BoxProps } from "../Box";

export interface ModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  modalContentProps?: BoxProps;
  modalContainerProps?: BoxProps;
}

function Modal(props: ModalProps) {
  const {
    children,
    isOpen = false,
    onClose,
    modalContentProps,
    modalContainerProps,
  } = props;

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }

  return (
    <ModalCore onClose={handleClose} isOpen={isOpen}>
      <ModalOverlay zIndex="1300" bg="rgba(0, 0, 0, 0.75)" />
      <ModalContent
        mt="50px"
        boxShadow="none"
        maxWidth="480px"
        bg="transparent"
        mx="auto"
        containerProps={{
          zIndex: 1700,
          ...modalContainerProps,
        }}
        {...modalContentProps}
      >
        {children}
      </ModalContent>
    </ModalCore>
  );
}

export default Modal;
