import { useMemo } from "react";

type ResultMetaProps = {
  total?: number;
  took?: number;
  isFetching: boolean;
};

export const ResultMeta = ({ total, took, isFetching }: ResultMetaProps) => {
  const tookMs = useMemo(() => {
    if (typeof took !== "number") {
      return undefined;
    }
    return took / 1_000_000;
  }, [took]);

  if (total === undefined && tookMs === undefined) {
    return null;
  }

  return (
    <span>
      Environ {total ?? 0} résultat{total && total > 1 ? "s" : ""}
      {typeof tookMs === "number" && ` (${tookMs.toFixed(2)} ms)`}
      {isFetching && " • Mise à jour…"}
    </span>
  );
};
