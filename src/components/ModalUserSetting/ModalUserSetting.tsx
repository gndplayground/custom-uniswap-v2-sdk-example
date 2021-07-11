import React from "react";
import { Box, BoxProps } from "../Box";
import Modal from "../Modal";
import Close from "../../icons/Close";
import { useTransactionSettingStore } from "../../stores/transactionSetting";

export interface ModalUserSettingProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MAX_SLIPPAGE = 5000;
const RISKY_SLIPPAGE_LOW = 50;
const RISKY_SLIPPAGE_HIGH = 500;

function ButtonSlip(props: BoxProps & { active?: boolean }) {
  const { active, children, ...others } = props;
  return (
    <Box
      minWidth="50px"
      textAlign="center"
      as="button"
      border="1px solid"
      bg={active ? "primary" : "transparent"}
      color={active ? "accent" : "inherit"}
      borderRadius="8px"
      p="2px 4px"
      transition="all 300ms ease-in"
      _hover={{
        bg: "primary",
      }}
      {...others}
    >
      {children}
    </Box>
  );
}

function InputSlip(props: React.HTMLProps<HTMLInputElement> & BoxProps) {
  return (
    <Box
      type="number"
      width="100%"
      outline="none"
      textAlign="right"
      as="input"
      border="1px solid"
      borderRadius="8px"
      p="2px 8px"
      color="accent"
      {...props}
    >
      {props.children}
    </Box>
  );
}

function ModalUserSetting(props: ModalUserSettingProps) {
  const { isOpen, onClose } = props;

  const { slippageTolerance, deadline, setSlippageTolerance, setDeadline } =
    useTransactionSettingStore();

  const [rawSlip, setRawSlip] = React.useState(slippageTolerance / 100);

  const [rawDeadline, setRawDeadline] = React.useState(deadline / 60);

  const [errorSlip, setErrorSlip] = React.useState<string | null>(null);

  const [errorDeadline, setErrorDeadline] = React.useState<string | null>(null);

  function handleChangeSlip(v: number) {
    return () => {
      setRawSlip(v);
    };
  }

  function handleChangeInputSlip(event: React.ChangeEvent<HTMLInputElement>) {
    setRawSlip(parseFloat(event.target.value));
  }

  function handleChangeDeadline(event: React.ChangeEvent<HTMLInputElement>) {
    setRawDeadline(parseFloat(event.target.value));
  }

  React.useEffect(() => {
    try {
      const rawValue = rawSlip * 100;
      if (!Number.isNaN(rawValue) && rawValue > 0 && rawValue < MAX_SLIPPAGE) {
        setSlippageTolerance(rawValue);
        setErrorSlip(null);
      } else {
        setErrorSlip("Enter a valid slippage percentage");
      }
    } catch {
      setErrorSlip("Enter a valid slippage percentage");
    }
  }, [rawSlip, setSlippageTolerance]);

  React.useEffect(() => {
    try {
      const rawValue = rawDeadline * 60;
      if (!Number.isNaN(rawValue) && rawValue > 0) {
        setDeadline(rawValue);
        setErrorDeadline(null);
      } else {
        setErrorDeadline("Enter a valid deadline");
      }
    } catch {
      setErrorDeadline("Enter a valid deadline");
    }
  }, [rawDeadline, setDeadline]);

  // Notify user if slippage is risky
  React.useEffect(() => {
    if (slippageTolerance < RISKY_SLIPPAGE_LOW) {
      setErrorSlip("Your transaction may fail");
    } else if (slippageTolerance > RISKY_SLIPPAGE_HIGH) {
      setErrorSlip("Your transaction may be frontrun");
    }
  }, [slippageTolerance]);

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
            Transaction settings
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
        <Box>
          <Box mt="6px">
            <Box as="h3" mt="16px">
              Slippage tolerance
            </Box>
            <Box display="flex" mt="6px">
              <ButtonSlip
                active={rawSlip === 0.1}
                onClick={handleChangeSlip(0.1)}
              >
                0.1%
              </ButtonSlip>
              <Box mx="8px">
                <ButtonSlip
                  active={rawSlip === 0.5}
                  onClick={handleChangeSlip(0.5)}
                >
                  0.5%
                </ButtonSlip>
              </Box>
              <ButtonSlip active={rawSlip === 1} onClick={handleChangeSlip(1)}>
                1%
              </ButtonSlip>
              <Box ml="8px" color="accent" position="relative">
                <InputSlip
                  pr="24px"
                  value={rawSlip.toString()}
                  onChange={handleChangeInputSlip}
                />
                <Box position="absolute" right="8px" top="2px" as="span">
                  %
                </Box>
              </Box>
            </Box>
            <Box mt="6px" as="p" color="error">
              {errorSlip}
            </Box>
          </Box>
          <Box mt="6px">
            <Box as="h3" mt="16px">
              Transaction deadline
            </Box>
            <Box display="flex" mt="6px" alignItems="center">
              <InputSlip
                width="60px"
                mr="8px"
                onChange={handleChangeDeadline}
                value={rawDeadline.toString()}
              />
              Minutes
            </Box>
            <Box mt="6px" as="p" color="error">
              {errorDeadline}
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalUserSetting;
