import { useEffect, useState } from "react";

// Tiny localStorage helper. Namespaced "mbc_", stores no personal data, and fails silently.
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`mbc_${key}`);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(`mbc_${key}`, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value, ready]);
  return [value, setValue] as const;
}
