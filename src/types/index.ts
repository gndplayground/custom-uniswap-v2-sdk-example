export interface TokenListDetail {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  isNative?: boolean;
}

export interface TokenListVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface TokenList {
  name: string;
  timestamp: Date;
  version: TokenListVersion;
  logoURI: string;
  keywords: string[];
  tokens: TokenListDetail[];
}

export enum Field {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
}
