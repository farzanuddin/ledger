import { useCallback, useMemo, useState } from "react";

export function useConfirmAction<T>() {
  const [item, setItem] = useState<T | null>(null);

  const request = useCallback((nextItem: T) => {
    setItem(nextItem);
  }, []);

  const clear = useCallback(() => {
    setItem(null);
  }, []);

  return useMemo(
    () => ({
      clear,
      item,
      request,
      visible: item !== null,
    }),
    [clear, item, request],
  );
}
