import React from "react";
import { TokenListDetail } from "../../types";
import Box, { BoxProps } from "../Box";
import LazyImage from "../LazyImage";
import Question from "../../icons/Question";

export interface TokenRowProps extends BoxProps {
  token: TokenListDetail;
  selected?: boolean;
}

function TokenRow(props: TokenRowProps) {
  const { token, selected, ...otherProps } = props;
  return (
    <Box py="8px" display="flex" alignItems="center">
      <Box
        as="button"
        width="100%"
        bg="transparent"
        display="flex"
        alignItems="center"
        disable={selected || undefined}
        {...otherProps}
      >
        <Box fontSize="40px" width="40px" height="40px" mr="16px">
          {!token.logoURI && <Question />}
          {token.logoURI && (
            <LazyImage
              placeholder={<Question />}
              src={token.logoURI}
              alt={token.name}
            />
          )}
        </Box>
        <Box textAlign="left">
          <strong>{token.symbol}</strong>
          <p>{token.name}</p>
        </Box>
      </Box>
    </Box>
  );
}

export default TokenRow;
