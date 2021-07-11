import { Signer } from "@ethersproject/abstract-signer";
import { Provider } from "@ethersproject/abstract-provider";
import { Contract } from "@ethersproject/contracts";
import { getAddress } from "@ethersproject/address";
import { parseBytes32String } from "@ethersproject/strings";
import { TokenListDetail } from "../../types";
import ERC20_ABI from "../../config/abis/erc20.json";
import { isAddress } from "../address";

const ERC20_BYTES32_ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

function parseStringOrBytes32(
  str: string | undefined,
  bytes32: string | undefined,
  defaultValue: string
): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue;
}

export async function getToken(
  provider: Signer | Provider,
  data: {
    address: string;
    chainId: number;
  }
): Promise<TokenListDetail | undefined> {
  const { address: defaultAddress, chainId } = data;

  const address = getAddress(defaultAddress);

  if (!address) return;

  try {
    const contract = new Contract(address, ERC20_ABI, provider);

    const contractBytes32 = new Contract(address, ERC20_BYTES32_ABI, provider);

    const promises = Promise.all<string, string, string, string, number>([
      contract.name(),
      contractBytes32.name(),
      contract.symbol(),
      contractBytes32.symbol(),
      contract.decimals(),
    ]);

    const d = await promises;

    const token: TokenListDetail = {
      name: parseStringOrBytes32(d[0], d[1], "Unknown Token"),
      symbol: parseStringOrBytes32(d[2], d[3], "Unknown Token"),
      chainId: chainId,
      address: address.toLowerCase(),
      decimals: d[4],
      logoURI: "",
    };

    return token;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return;
  }
}

export function filterTokens(
  tokens: TokenListDetail[],
  search: string
): TokenListDetail[] {
  if (search.length === 0) return tokens;

  const searchingAddress = isAddress(search);

  if (searchingAddress) {
    return tokens.filter((token) => token.address === searchingAddress);
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0);

  if (lowerSearchParts.length === 0) {
    return tokens;
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((str) => str.length > 0);

    return lowerSearchParts.every(
      (p) =>
        p.length === 0 ||
        sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p))
    );
  };

  return tokens.filter((token) => {
    const { symbol, name } = token;

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name));
  });
}
