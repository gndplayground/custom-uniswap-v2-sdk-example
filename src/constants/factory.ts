import { SupportedChainId } from "./chain";

export const FACTORY_ADDRESSES: {
  [chainId: number]: string;
} = {
  [SupportedChainId.BSC]: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  [SupportedChainId.MATIC]: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
};

export const INIT_CODE_HASHES: {
  [chainId: number]: string;
} = {
  [SupportedChainId.BSC]:
    "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5",
  [SupportedChainId.MATIC]:
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
};
