import { useToast as useToastCore } from "@chakra-ui/toast";
import { UseToastOptions } from "@chakra-ui/toast/dist/types/use-toast";
import React from "react";

export default function useToast(options?: UseToastOptions) {
  const op: UseToastOptions = React.useMemo(() => {
    return {
      position: "top-right",
      ...options,
    };
  }, [options]);

  return useToastCore(op);
}
