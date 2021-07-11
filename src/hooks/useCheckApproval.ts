import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Interface } from "@ethersproject/abi";
import { MaxUint256 } from "@ethersproject/constants";
import { Currency, Token } from "@uniswap/sdk-core";
import useWallet from "./useWallet";
import useToast from "./useToast";
import ERC20 from "../config/abis/erc20.json";

export enum ApprovalState {
  UNKNOWN = "UNKNOWN",
  NOT_APPROVED = "NOT_APPROVED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
}

export function useCheckApproval(
  token: Currency | undefined,
  spender: string
): { approve: () => Promise<void>; state: ApprovalState } {
  const wallet = useWallet();

  const toast = useToast();

  const [pending, setApprovalPending] = React.useState<boolean>(false);

  const [approved, setApproved] = React.useState<boolean | undefined>(
    undefined
  );

  const tokenCheck = React.useMemo<Token | undefined>(() => {
    return token && token.isToken ? token : undefined;
  }, [token]);

  const contract: Contract | undefined = React.useMemo(() => {
    if (!wallet.ether && !tokenCheck) {
      return undefined;
    }

    if (tokenCheck) {
      return new Contract(
        tokenCheck.address,
        new Interface(ERC20),
        wallet.account && wallet.ether ? wallet.ether.getSigner() : wallet.ether
      );
    }

    return undefined;
  }, [tokenCheck, wallet.account, wallet.ether]);

  const approve = React.useCallback(async (): Promise<void> => {
    if (!approved && contract) {
      try {
        setApprovalPending(true);

        const estimatedGas = await contract.estimateGas.approve(
          spender,
          MaxUint256
        );

        const trans = await contract.approve(spender, MaxUint256, {
          gasLimit: estimatedGas,
        });

        await trans.wait();

        setApproved(true);

        setApprovalPending(false);
      } catch (e) {
        setApprovalPending(false);
        toast({
          description: "Failed to approve token",
          variant: "error",
        });
        // eslint-disable-next-line no-console
        console.error("Failed to approve token", e);
      }
    }
  }, [approved, contract, toast, spender]);

  const approvalState = React.useMemo<ApprovalState>(() => {
    if (!tokenCheck) {
      return ApprovalState.UNKNOWN;
    }

    if (tokenCheck && tokenCheck.isNative) {
      return ApprovalState.APPROVED;
    }

    if (pending) return ApprovalState.PENDING;
    if (approved) return ApprovalState.APPROVED;
    return ApprovalState.NOT_APPROVED;
  }, [approved, pending, tokenCheck]);

  React.useEffect(() => {
    if (wallet.account && contract) {
      contract
        .allowance(wallet.account, spender)
        .then((r: any) => {
          setApproved(!BigNumber.from(r).eq(0));
        })
        .catch((e: any) => {
          // eslint-disable-next-line no-console
          console.error("Failed getReserves " + e);
        });
    }
  }, [contract, spender, wallet.account]);

  return { state: approvalState, approve };
}
