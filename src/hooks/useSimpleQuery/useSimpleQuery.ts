import React from "react";

interface QueryState<T> {
  result: T | undefined;
  error: any | undefined;
  isFetched: boolean;
  isFetching: boolean;
  isFailed: boolean;
}

export interface SimpleQueryOptions {
  disableAutoCall?: boolean;
}

export default function useSimpleQuery<T = any>(
  query: Promise<T>,
  options: SimpleQueryOptions = {}
) {
  const { disableAutoCall } = options;
  const [state, setState] = React.useState<QueryState<T>>({
    isFailed: false,
    isFetched: false,
    isFetching: false,
    result: undefined,
    error: undefined,
  });

  const fetch = React.useCallback(() => {
    setState((current) => {
      return {
        ...current,
        isFailed: false,
        isFetched: current.isFetched || false,
        isFetching: true,
      };
    });

    query
      .then((r) => {
        setState((current) => {
          return {
            ...current,
            result: r,
            isFailed: false,
            isFetched: true,
            isFetching: false,
          };
        });
      })
      .catch((e) => {
        setState((current) => {
          return {
            ...current,
            error: e,
            isFailed: true,
            isFetched: true,
            isFetching: false,
          };
        });
      });
  }, [query]);

  React.useEffect(() => {
    if (!disableAutoCall) {
      fetch();
    }
  }, [disableAutoCall, fetch, query]);

  React.useEffect(() => {
    setState((current) => {
      return {
        ...current,
        isFetched: false,
      };
    });
  }, [query]);

  return {
    ...state,
    fetch,
  };
}
