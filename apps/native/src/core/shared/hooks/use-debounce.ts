import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 400,
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Siempre apunta a la última versión del callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Limpia el timer al desmontar
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback(
    (...args: A) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay],
  );
}
