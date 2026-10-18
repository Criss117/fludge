import { useEffect } from "react";

const mounted = { current: 0 };

export function useMountCounter(label: string) {
  useEffect(() => {
    mounted.current += 1;
    console.log(`${label} montadas:`, mounted.current);
    return () => {
      mounted.current -= 1;
      console.log(`${label} montadas:`, mounted.current);
    };
  }, [label]);
}
