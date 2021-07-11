import React from "react";
import axios from "axios";
import { FixedSizeList } from "react-window";
import { TokenList, TokenListDetail } from "../../types";
import useWallet from "../../hooks/useWallet";
import useSimpleQuery from "../../hooks/useSimpleQuery";
import { isAddress } from "ethers/lib/utils";
import useWindowDimensions from "../../hooks/useWindowDimension";
import { filterTokens, getToken } from "../../utils/tokens/search";
import Modal from "../Modal";
import { Spinner } from "@chakra-ui/spinner";
import TokenRow from "../TokenRow";
import Box from "../Box";
import Close from "../../icons/Close";
import { ETHER_TOKEN_LIST } from "../../constants/tokens";

export interface ModalSelectTokenProps {
  selectedToken?: string;
  removeTokens?: string[];
  tokenList: string | TokenListDetail[];
  isOpen?: boolean;
  onClose?: () => void;
  onSelectToken?: (token: TokenListDetail) => void;
  additionalTokenList?: TokenListDetail[];
}

function ModalSelectToken(props: ModalSelectTokenProps) {
  const {
    isOpen,
    onClose,
    tokenList,
    selectedToken,
    onSelectToken,
    removeTokens,
    additionalTokenList,
  } = props;
  const { chainId, ether: provider } = useWallet();

  const [searchToken, setSearchToken] = React.useState<
    TokenListDetail | undefined
  >();

  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const memoQuery = React.useMemo(() => {
    if (typeof tokenList !== "string") {
      return new Promise<TokenListDetail[]>((resolve) => {
        resolve(tokenList);
      });
    }
    return new Promise<TokenListDetail[]>((resolve, reject) => {
      // Should cache in store
      axios
        .get<TokenList>(tokenList)
        .then((d) => {
          resolve(d.data.tokens);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }, [tokenList]);

  const { fetch, isFetched, result } = useSimpleQuery<TokenListDetail[]>(
    memoQuery,
    {
      disableAutoCall: true,
    }
  );

  const { height } = useWindowDimensions();

  React.useEffect(() => {
    setSearchToken(undefined);

    const address = isAddress(searchQuery);

    if (searchQuery && address && provider && chainId) {
      getToken(provider, {
        address: searchQuery,
        chainId,
      })
        .then((t) => {
          setSearchToken(t);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.log("Failed search token: " + e);
          setSearchToken(undefined);
        });
    }
  }, [chainId, searchQuery, provider]);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setSearchQuery(input);
  };

  const handleSelectToken = React.useCallback(
    (t: TokenListDetail) => {
      return () => {
        if (onSelectToken && onClose) {
          onClose();
          onSelectToken(t);
        }
      };
    },
    [onClose, onSelectToken]
  );

  React.useEffect(() => {
    if (isOpen && tokenList) {
      fetch();
    }
  }, [tokenList, isOpen, fetch]);

  const heightList = React.useMemo(() => {
    return (height * 80) / 100 - 300;
  }, [height]);

  const itemKey = React.useCallback(
    (index: number, data: TokenListDetail[]) =>
      data[index].symbol + "-" + data[index].address,
    []
  );

  const Row = React.useCallback(
    ({ data, index, style }) => {
      const t: TokenListDetail = data[index];
      const isSelected =
        t.address.toLowerCase() === selectedToken?.toLowerCase();
      return (
        <li key={`${t.symbol}-${t.address}`} style={style}>
          <TokenRow
            selected={isSelected}
            token={t}
            onClick={!isSelected ? handleSelectToken(t) : undefined}
          />
        </li>
      );
    },
    [handleSelectToken, selectedToken]
  );

  const etherToken = React.useMemo(() => {
    if (chainId) {
      return ETHER_TOKEN_LIST[chainId];
    }
  }, [chainId]);

  const filteredTokens: TokenListDetail[] = React.useMemo(() => {
    let arr = Object.values(result || []).sort((a, b) => {
      return a.symbol > b.symbol ? 1 : 0;
    });

    arr = [
      ...(etherToken ? [etherToken] : []),
      ...(additionalTokenList || []),
      ...arr,
    ].filter((t) => {
      if (!removeTokens) {
        return true;
      }
      return removeTokens.indexOf(t.address) === -1;
    });

    return filterTokens(arr, searchQuery);
  }, [result, additionalTokenList, searchQuery, removeTokens, etherToken]);

  const listToken = searchToken ? [searchToken] : filteredTokens;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
        maxHeight="80vh"
      >
        <Box as="header" display="flex" alignItems="center">
          <Box
            as="h2"
            fontSize={{ base: "16px", xl: "24px" }}
            lineHeight="35px"
            fontWeight={700}
          >
            Select Token
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
        <Box mt="24px">
          <Box
            _hover={{
              borderColor: "primary",
            }}
            _focus={{
              borderColor: "primary",
            }}
            outline="none"
            width="100%"
            as="input"
            border="1px solid"
            bg="transparent"
            height="40px"
            padding="8px 16px"
            onChange={handleInput}
            placeholder="Search name or paste address"
          />
        </Box>
        {!isFetched && (
          <Box mt="24px" display="flex" justifyContent="center">
            <Spinner />
          </Box>
        )}
        {result && (
          <Box as="ul" overflow="auto" mt="24px">
            <FixedSizeList
              width="100%"
              height={heightList}
              itemData={listToken}
              itemCount={listToken.length}
              itemSize={64}
              itemKey={itemKey}
            >
              {Row}
            </FixedSizeList>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default ModalSelectToken;
