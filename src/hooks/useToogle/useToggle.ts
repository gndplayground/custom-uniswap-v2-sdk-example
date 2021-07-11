import { useState, useCallback, useMemo } from "react";

const useToggle = (defaultState = false) => {
  const [active, setIsActive] = useState(defaultState);

  const setActive = useCallback(() => {
    setIsActive(true);
  }, []);

  const setInActive = useCallback(() => {
    setIsActive(false);
  }, []);

  const toggle = useCallback(
    (state?: boolean) => {
      setIsActive("boolean" === typeof state ? state : !active);
    },
    [active]
  );

  const toggleCallback = useCallback(
    (state?: boolean) => {
      return () => {
        setIsActive("boolean" === typeof state ? state : !active);
      };
    },
    [active]
  );

  return useMemo(() => {
    return {
      active,
      setActive,
      setInActive,
      toggle,
      toggleCallback,
    };
  }, [active, setActive, setInActive, toggle, toggleCallback]);
};

export default useToggle;
