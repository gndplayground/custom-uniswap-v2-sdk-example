import React from "react";
import ButtonCore from "../../../../components/ButtonCore";
import Box from "../../../../components/Box";
import InputToken from "../../../../components/InputToken";
import ArrowDown from "../../../../icons/ArrowDown";
import ArrowUp from "../../../../icons/ArrowUp";
import Setting from "../../../../icons/Setting";
import ModalUserSetting from "../../../../components/ModalUserSetting";
import useToggle from "../../../../hooks/useToogle";
import ModalSelectToken from "../../../../components/ModalSelectToken";
import { Field, TokenListDetail } from "../../../../types";
import { Currency, CurrencyAmount, Token } from "@uniswap/sdk-core";
import useWallet from "../../../../hooks/useWallet";
import { useTokenBalances } from "../../../../hooks/wallet";
import { formatCurrencyAmount } from "../../../../utils/currency";
import { ExtendedEther } from "../../../../constants/tokens";
import { useTransactionSettingStore } from "../../../../stores/transactionSetting";
import { useTrade, useTradePriceSummary } from "../../../../hooks/swap/trade";
import SwapFooter from "../SwapFooter";
import { SupportedChainId } from "../../../../constants/chain";
import useWrapCallback, { WrapType } from "../../../../hooks/swap/wrap";
import useApp from "../../../../hooks/useApp";
import {
  ApprovalState,
  useCheckApproval,
} from "../../../../hooks/useCheckApproval";
import { ROUTERS } from "../../../../constants/routing";
import { useSwap } from "../../../../hooks/swap/swap";
import { maxAmountSpend } from "../../../../utils/maxAmountSpend";

interface SwapState {
  openSelect?: Field;
  independentField: Field;
  typedValue: string;
  [Field.INPUT]?: TokenListDetail | undefined;
  [Field.OUTPUT]?: TokenListDetail | undefined;
}

const TokenLists: { [chainId: number]: string } = {
  [SupportedChainId.MATIC]:
    "https://unpkg.com/quickswap-default-token-list@1.0.71/build/quickswap-default.tokenlist.json",
  [SupportedChainId.BSC]:
    "https://tokens.pancakeswap.finance/pancakeswap-extended.json",
};

function SwapBoard() {
  const app = useApp();

  const { slippageTolerance, deadline } = useTransactionSettingStore();

  const toggleSettings = useToggle(false);

  const toggleSelectToken = useToggle(false);

  const { account, chainId, ether, rawBalance } = useWallet();

  const [swapState, setSwapState] = React.useState<SwapState>({
    typedValue: "",
    independentField: Field.INPUT,
  });

  const dependentField: Field =
    swapState.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const selectedCurrency: {
    [Field.INPUT]: Currency | undefined;
    [Field.OUTPUT]: Currency | undefined;
  } = React.useMemo(() => {
    const tInput = swapState[Field.INPUT];

    const tOutput = swapState[Field.OUTPUT];

    let rInput: Currency | undefined;
    let rOutput: Currency | undefined;

    if (tInput && chainId) {
      if (tInput.isNative) {
        rInput = ExtendedEther.onChain(chainId);
      } else {
        rInput = new Token(
          chainId,
          tInput.address,
          tInput.decimals,
          tInput.symbol,
          tInput.name
        );
      }
    }

    if (tOutput && chainId) {
      if (tOutput.isNative) {
        rOutput = ExtendedEther.onChain(chainId);
      } else {
        rOutput = new Token(
          chainId,
          tOutput.address,
          tOutput.decimals,
          tOutput.symbol,
          tOutput.name
        );
      }
    }

    if (tOutput?.isNative && chainId) {
      rOutput = ExtendedEther.onChain(chainId);
    }

    return {
      [Field.INPUT]: rInput,
      [Field.OUTPUT]: rOutput,
    };
  }, [chainId, swapState]);

  const approvalInput = useCheckApproval(
    selectedCurrency[Field.INPUT],
    ROUTERS[chainId]
  );

  const approvalOutput = useCheckApproval(
    selectedCurrency[Field.OUTPUT],
    ROUTERS[chainId]
  );

  const isApproving =
    approvalInput.state === ApprovalState.PENDING ||
    approvalOutput.state === ApprovalState.PENDING;

  const isRequireApprove =
    isApproving ||
    approvalInput.state === ApprovalState.NOT_APPROVED ||
    approvalOutput.state === ApprovalState.NOT_APPROVED;

  const balances = useTokenBalances(
    account ?? undefined,
    React.useMemo(() => {
      return [selectedCurrency[Field.INPUT], selectedCurrency[Field.OUTPUT]];
    }, [selectedCurrency]),
    ether
  );

  const selectedCurrencyBalances: {
    [Field.INPUT]: { formatted: string; raw: CurrencyAmount<Currency> };
    [Field.OUTPUT]: { formatted: string; raw: CurrencyAmount<Currency> };
  } = React.useMemo(() => {
    const tInput = selectedCurrency[Field.INPUT];
    const tOutput = selectedCurrency[Field.OUTPUT];

    let rInput: CurrencyAmount<Currency> | undefined =
      balances.amounts[(tInput?.isToken && tInput?.address) || "___"];
    let rOutput: CurrencyAmount<Currency> | undefined =
      balances.amounts[(tOutput?.isToken && tOutput?.address) || "___"];

    if (tInput && tInput.isNative) {
      rInput = CurrencyAmount.fromRawAmount(
        tInput,
        rawBalance?.toString() || "0"
      );
    }
    if (tOutput && tOutput.isNative) {
      rOutput = CurrencyAmount.fromRawAmount(
        tOutput,
        rawBalance?.toString() || "0"
      );
    }

    return {
      [Field.INPUT]: {
        formatted: formatCurrencyAmount(rInput, 4),
        raw: rInput,
      },
      [Field.OUTPUT]: {
        formatted: formatCurrencyAmount(rOutput, 4),
        raw: rOutput,
      },
    };
  }, [balances.amounts, rawBalance, selectedCurrency]);

  const { trade, parsedAmount } = useTrade({
    typedValue: swapState.typedValue,
    independentField: swapState.independentField,
    fields: selectedCurrency,
  });

  const priceSummary = useTradePriceSummary({ trade });

  const swap = useSwap({
    trade,
    deadline,
    slippageTolerance,
  });

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
    isExecuting,
  } = useWrapCallback(
    selectedCurrency[Field.INPUT],
    selectedCurrency[Field.OUTPUT],
    swapState.typedValue
  );

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

  const parsedAmounts = React.useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]:
              swapState.independentField === Field.INPUT
                ? parsedAmount
                : trade?.inputAmount,
            [Field.OUTPUT]:
              swapState.independentField === Field.OUTPUT
                ? parsedAmount
                : trade?.outputAmount,
          },
    [swapState.independentField, parsedAmount, showWrap, trade]
  );

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
    selectedCurrencyBalances[Field.INPUT].raw,
    chainId
  );

  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
      !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount)
  );

  function handleOpenSelectToken(field: Field) {
    return () => {
      setSwapState((c) => {
        return {
          ...c,
          openSelect: field,
        };
      });
      toggleSelectToken.setActive();
    };
  }

  const handleSelectToken = React.useCallback(
    (token: TokenListDetail) => {
      if (swapState.openSelect) {
        setSwapState((c) => {
          return {
            ...c,
            [swapState.openSelect === Field.OUTPUT
              ? Field.OUTPUT
              : Field.INPUT]: token,
          };
        });
      }
    },
    [swapState.openSelect]
  );

  const handleChangeFromTo = () => {
    if (swapState[Field.INPUT] || swapState[Field.OUTPUT]) {
      setSwapState((c) => {
        return {
          ...c,
          [Field.INPUT]: c[Field.OUTPUT],
          [Field.OUTPUT]: c[Field.INPUT],
        };
      });
    }
  };

  const hideCurrency = React.useMemo<string[] | undefined>(() => {
    const output = swapState[Field.OUTPUT];

    if (swapState.openSelect === Field.INPUT && output) {
      return [output.address];
    }

    const input = swapState[Field.INPUT];

    if (swapState.openSelect === Field.OUTPUT && input) {
      return [input.address];
    }

    return undefined;
  }, [swapState]);

  function handleInput(value: string) {
    setSwapState((c) => {
      return {
        ...c,
        independentField: Field.INPUT,
        typedValue: value,
      };
    });
  }

  function handleOutput(value: string) {
    setSwapState((c) => {
      return {
        ...c,
        independentField: Field.OUTPUT,
        typedValue: value,
      };
    });
  }

  function handleMax() {
    if (maxInputAmount) {
      setSwapState((c) => {
        return {
          ...c,
          independentField: Field.INPUT,
          typedValue: maxInputAmount.toExact(),
        };
      });
    }
  }

  React.useEffect(() => {
    setSwapState({
      typedValue: "",
      independentField: Field.INPUT,
    });
  }, [chainId]);

  const formattedAmounts = {
    [swapState.independentField]: swapState.typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[swapState.independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  let error = "";

  if (
    trade?.inputAmount &&
    trade?.inputAmount.greaterThan(selectedCurrencyBalances[Field.INPUT].raw)
  ) {
    error = `Insufficient ${selectedCurrency[Field.INPUT]?.symbol} balance`;
  }

  if (!trade && wrapType === WrapType.NOT_APPLICABLE) {
    error = "Insufficient liquidity for this trade";
  }

  if (
    wrapType === WrapType.NOT_APPLICABLE &&
    selectedCurrency[Field.OUTPUT] &&
    selectedCurrency[Field.INPUT] &&
    selectedCurrency[Field.INPUT]?.equals(selectedCurrency[Field.OUTPUT] as any)
  ) {
    error = "Can't swap the same token";
  }

  return (
    <React.Fragment>
      <Box
        border="1px solid"
        borderColor="#fff"
        borderRadius="4px"
        py="32px"
        px="24px"
      >
        <Box display="flex">
          <Box as="p">
            Slippage Tolerance:{" "}
            <Box as="strong" color="primary">
              {slippageTolerance / 100}%
            </Box>
          </Box>
          <Box as="button" aria-label="Setting slippage tolerance" ml="8px">
            <Setting onClick={toggleSettings.setActive} />
          </Box>
        </Box>
        <Box mt="24px">
          <InputToken
            onMax={handleMax}
            showMaxButton={showMaxButton}
            disabled={isExecuting || isApproving}
            inputProps={{
              value: formattedAmounts[Field.INPUT],
            }}
            onUserInput={handleInput}
            selectedToken={swapState[Field.INPUT]}
            selectTokenProps={{
              onClick: handleOpenSelectToken(Field.INPUT),
            }}
            label="From"
            id="from"
            balance={selectedCurrencyBalances[Field.INPUT].formatted}
          />
        </Box>
        <Box mt="24px" display="flex" justifyContent="center">
          <Box
            as="button"
            aria-label="Change from and to token"
            onClick={handleChangeFromTo}
          >
            <Box as="span" aria-hidden={true} display="flex">
              <ArrowDown />
              <Box position="relative" left="-6px">
                <ArrowUp />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box mt="24px">
          <InputToken
            disabled={isExecuting || isApproving}
            inputProps={{
              value: formattedAmounts[Field.OUTPUT],
            }}
            onUserInput={handleOutput}
            selectedToken={swapState[Field.OUTPUT]}
            selectTokenProps={{
              onClick: handleOpenSelectToken(Field.OUTPUT),
            }}
            label="To"
            id="to"
            balance={selectedCurrencyBalances[Field.OUTPUT].formatted}
          />
        </Box>
        <Box
          mt="24px"
          display="flex"
          justifyContent="center"
          sx={{
            "& > *:nth-child(1)": {
              marginRight: "8px",
            },
          }}
        >
          {!account && (
            <ButtonCore
              onClick={() => {
                app.toggleOpenConnect(true);
              }}
              width="80%"
            >
              Connect Wallet
            </ButtonCore>
          )}
          {account &&
            isRequireApprove &&
            (approvalInput.state === ApprovalState.PENDING ||
              approvalInput.state === ApprovalState.NOT_APPROVED) && (
              <ButtonCore
                width="80%"
                disabled={isApproving}
                onClick={approvalInput.approve}
                isLoading={isApproving}
              >
                Approve {selectedCurrency[Field.INPUT]?.symbol}
              </ButtonCore>
            )}
          {account &&
            isRequireApprove &&
            (approvalOutput.state === ApprovalState.PENDING ||
              approvalOutput.state === ApprovalState.NOT_APPROVED) && (
              <ButtonCore
                width="80%"
                disabled={isApproving}
                onClick={approvalOutput.approve}
                isLoading={isApproving}
              >
                Approve {selectedCurrency[Field.OUTPUT]?.symbol}
              </ButtonCore>
            )}
          {account && showWrap && !isRequireApprove && (
            <ButtonCore
              width="80%"
              disabled={Boolean(wrapInputError) || isExecuting}
              onClick={onWrap}
              isLoading={isExecuting}
            >
              {wrapInputError ??
                (wrapType === WrapType.WRAP ? (
                  <span>Wrap</span>
                ) : wrapType === WrapType.UNWRAP ? (
                  <span>Unwrap</span>
                ) : null)}
            </ButtonCore>
          )}

          {account &&
            !showWrap &&
            !isRequireApprove &&
            selectedCurrency[Field.INPUT] &&
            selectedCurrency[Field.OUTPUT] && (
              <ButtonCore
                disabled={error !== "" || swap.isSwapping}
                onClick={swap.handleSwap}
                isLoading={swap.isSwapping}
                width="80%"
              >
                {error ? error : "Swap"}
              </ButtonCore>
            )}
        </Box>
        <ModalUserSetting
          isOpen={toggleSettings.active}
          onClose={toggleSettings.setInActive}
        />
        {toggleSelectToken.active && (
          <ModalSelectToken
            removeTokens={hideCurrency}
            onSelectToken={handleSelectToken}
            isOpen={toggleSelectToken.active}
            onClose={toggleSelectToken.setInActive}
            tokenList={TokenLists[chainId]}
          />
        )}
      </Box>
      {trade && wrapType === WrapType.NOT_APPLICABLE && (
        <SwapFooter {...priceSummary} />
      )}
    </React.Fragment>
  );
}

export default SwapBoard;
