import { useCallback, useEffect, useRef, useState } from "react";

interface UseClipboardOptions {
  /**
   * Milliseconds before the `copied` flag resets to `false` after a
   * successful copy. Defaults to 2500ms.
   */
  resetMs?: number;
}

interface UseClipboardReturn {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

const DEFAULT_RESET_MS = 2500;

/**
 * Copies arbitrary text to the system clipboard and tracks a transient
 * `copied` state that auto-resets after `resetMs`. Clipboard failures are
 * swallowed (logged via `console.warn`) so callers never crash on a denied
 * permission or unsupported browser.
 */
export function useClipboard(opts?: UseClipboardOptions): UseClipboardReturn {
  const resetMs = opts?.resetMs ?? DEFAULT_RESET_MS;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  // Clear any pending reset timer on unmount so we never set state on an
  // unmounted component.
  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(
    async (text: string): Promise<void> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current !== undefined) {
          window.clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
          setCopied(false);
          timerRef.current = undefined;
        }, resetMs);
      } catch (error) {
        console.warn("useClipboard: failed to write to clipboard", error);
      }
    },
    [resetMs],
  );

  return { copied, copyToClipboard };
}