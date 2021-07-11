import React from "react";
import Box from "../../../../components/Box";

export interface SwapFooterProps {
  receivedTitle: string;
  received: string;
  receivedSymbol: string;
  priceImpact: string;
  fee: string;
  route?: string;
}

const styles = {
  marginTop: "20px",
  marginLeft: "auto",
  marginRight: "auto",
  border: "1px solid #fff",
  borderRadius: "4px",
  padding: "20px",
};

function SwapFooter(props: SwapFooterProps) {
  const { fee, received, receivedSymbol, receivedTitle, priceImpact, route } =
    props;

  return (
    <Box {...styles}>
      <Box display="flex">
        {receivedTitle}
        <Box as="strong" ml="auto">
          {received}
          <span> {receivedSymbol}</span>
        </Box>
      </Box>
      <Box display="flex">
        Price Impact{" "}
        <Box as="strong" ml="auto">
          {priceImpact}
        </Box>
      </Box>
      <Box display="flex">
        Liquidity Provider Fee{" "}
        <Box as="strong" ml="auto">
          {fee}
        </Box>
      </Box>
      <Box display="flex">
        Route{" "}
        <Box as="strong" ml="auto">
          {route}
        </Box>
      </Box>
    </Box>
  );
}

export default SwapFooter;
