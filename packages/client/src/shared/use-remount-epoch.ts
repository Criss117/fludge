import { useSyncExternalStore } from "react";
type Listener = () => void;

let epoch = 0;
const listeners = new Set<Listener>();

export function bumpRemount() {
  epoch += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeRemount(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRemountEpoch() {
  return epoch;
}

export function useRemountEpoch() {
  return useSyncExternalStore(
    subscribeRemount,
    getRemountEpoch,
    getRemountEpoch,
  );
}
