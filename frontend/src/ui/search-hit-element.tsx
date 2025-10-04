import { ReactNode, useMemo } from "react";
import { BleveHit } from "../types/search-hit";
import { createSnippet, highlight, parseS3Identifier } from "../utils/hits";
import { Download } from "lucide-react";

type SearchHitCardProps = {
  hit: BleveHit;
  query: string;
};

const SearchHitCard = ({ hit, query }: SearchHitCardProps) => {
  const { bucket, key } = parseS3Identifier(hit.id);
  const content =
    typeof hit.fields?.content === "string" ? hit.fields.content : "";
  const snippet = useMemo(
    () => createSnippet(content, query),
    [content, query]
  );

  return (
    <article className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <a
          href={`/api/download?key=${encodeURIComponent(key)}`}
          target="_blank"
          rel="noreferrer"
        >
          <Download className="h-4 w-4 text-gray-500" />
        </a>
        <div className="text-xs text-gray-500">
          <span className="font-medium text-gray-600">{bucket}</span>
          <span className="mx-1 text-gray-400">›</span>
          <span className="break-all text-gray-500">{key}</span>
        </div>
      </div>
      <p className="text-sm leading-6 text-gray-700">
        {highlight(snippet, query)}
      </p>
      {typeof hit.score === "number" && (
        <span className="text-xs text-gray-400">
          Score : {hit.score.toFixed(2)}
        </span>
      )}
    </article>
  );
};

export default SearchHitCard;
