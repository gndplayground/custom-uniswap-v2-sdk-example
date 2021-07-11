import { Currency } from "@uniswap/sdk-core";
import { ETHER_TOKEN_LIST } from "../../constants/tokens";

export function getTokenSymbol(
  token: Currency | undefined,
  chainId: number
): string | undefined {
  if (!token) {
    return "";
  }

  if (token?.isNative) {
    return ETHER_TOKEN_LIST[chainId]?.symbol;
  }

  return token.symbol;
}
