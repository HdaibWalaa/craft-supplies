import { useCallback, useEffect, useState } from "react";

export function useAsync<T>(loader: () => Promise<T>, dependencies: readonly unknown[] = []) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    let active = true;
    setLoading(true); setError(undefined);
    loader().then((value) => active && setData(value)).catch((reason: unknown) => active && setError(reason instanceof Error ? reason : new Error(String(reason)))).finally(() => active && setLoading(false));
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  useEffect(() => reload(), [reload]);
  useEffect(() => { const listener = () => reload(); window.addEventListener("storefront:refresh", listener); return () => window.removeEventListener("storefront:refresh", listener); }, [reload]);
  return { data, error, loading, reload };
}
