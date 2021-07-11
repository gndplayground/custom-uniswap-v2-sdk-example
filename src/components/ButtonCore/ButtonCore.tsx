import React from "react";
import Box from "../Box";
import { Spinner } from "@chakra-ui/spinner";
import { HTMLChakraProps } from "@chakra-ui/system";

export interface ButtonCoreProps extends HTMLChakraProps<"button"> {
  children?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

function ButtonCore(props: ButtonCoreProps) {
  const { children, isLoading, ...others } = props;

  return (
    <Box
      border="1px solid"
      borderColor="primary"
      _hover={{
        color: "primary",
      }}
      _focus={{
        color: "primary",
      }}
      _disabled={{
        opacity: "0.8",
        color: "#ccc",
        cursor: "not-allowed",
      }}
      px="16px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="#fff"
      fontWeight={700}
      borderRadius="4px"
      fontSize="16px"
      lineHeight="21px"
      textAlign="center"
      as="button"
      height={{ base: "32px", xl: "40px" }}
      {...(others as any)}
    >
      {children}
      {isLoading && (
        <Box ml="8px" width="16px" height="16px">
          <Spinner speed="1s" width="16px" height="16px" thickness="2px" />
        </Box>
      )}
    </Box>
  );
}

export default ButtonCore;
