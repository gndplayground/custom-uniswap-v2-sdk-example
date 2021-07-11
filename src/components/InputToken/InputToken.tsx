import React from "react";
import Box, { BoxProps } from "../Box";
import ButtonCore from "../ButtonCore";
import ArrowDown from "../../icons/ArrowDown";
import { TokenListDetail } from "../../types";
import LazyImage from "../LazyImage";
import Question from "../../icons/Question";
import { escapeRegExp } from "../../utils/regex";

export interface InputTokenProps {
  disabled?: boolean;
  selectedToken?: TokenListDetail;
  label: string;
  balance?: string;
  id: string;
  inputProps?: React.AllHTMLAttributes<HTMLInputElement> & BoxProps;
  selectTokenProps?: React.AllHTMLAttributes<HTMLButtonElement> & BoxProps;
  onUserInput?: (value: string) => void;
  onMax?: () => void;
  showMaxButton?: boolean;
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

export default function InputToken(props: InputTokenProps) {
  const {
    disabled,
    label,
    id,
    inputProps,
    balance,
    selectTokenProps,
    selectedToken,
    onUserInput,
    onMax,
    showMaxButton,
  } = props;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/,/g, ".");

    if (onUserInput && (value === "" || inputRegex.test(escapeRegExp(value)))) {
      onUserInput(value);
    }
  }

  return (
    <Box background="#000829" px="16px" py="16px">
      <Box display="flex">
        <Box as="label" fontWeight={500} htmlFor={id} display="block">
          {label}
        </Box>
        {balance && (
          <Box ml="auto" as="p">
            Balance:{" "}
            <Box as="strong" color="primary">
              {balance}
            </Box>
          </Box>
        )}
      </Box>
      <Box display="flex" mt="8px">
        <Box
          disabled={disabled}
          flex="1"
          outline="none"
          border="none"
          height="40px"
          bg="transparent"
          placeholder="0.0"
          pr="16px"
          {...(inputProps as any)}
          as="input"
          id={id}
          onChange={handleChange}
        />
        <Box ml="auto" display="flex">
          {showMaxButton && (
            <Box as="button" color="primary" onClick={onMax}>
              Max
            </Box>
          )}
          <ButtonCore
            ml="16px"
            disabled={disabled}
            {...(selectTokenProps as any)}
            display="flex"
            alignItems="center"
          >
            {!selectedToken && "Select a token"}
            {selectedToken && (
              <Box display="flex" alignItems="center">
                <Box fontSize="26px" height="26px" width="26px" mr="4px">
                  <LazyImage
                    alt={selectedToken.name}
                    placeholder={<Question />}
                    src={selectedToken.logoURI}
                  />
                </Box>
                {selectedToken.symbol}
              </Box>
            )}
            <Box ml="4px" as="span" aria-hidden={true}>
              <ArrowDown />
            </Box>
          </ButtonCore>
        </Box>
      </Box>
    </Box>
  );
}
