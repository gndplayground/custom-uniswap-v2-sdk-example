import { useEffect, useRef } from "react";

export default function usePrev<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
