import { useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { useSearch } from "../lib/api";
import Input from "../ui/input";
import Pagination from "../ui/pagination";
import { BleveResponse } from "../types/search-hit";
import SearchHitCard from "../ui/search-hit-element";
import { ResultMeta } from "../ui/meta-result";

const SearchResult = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const nav = useNavigate();
  const query = searchParams.get("q") || "";
  const page = parsePage(searchParams.get("page"));
  const limit = 20;
  const from = (page - 1) * limit;

  useEffect(() => {
    if (!query) {
      nav("/");
    }
  }, [nav, query]);

  const { data, isLoading, isError, error, isFetching } = useSearch({
    query,
    from,
    limit,
  });
  const searchResult = (data as BleveResponse | undefined) ?? undefined;
  const hits = searchResult?.hits ?? [];
  const totalHits = searchResult?.total_hits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / limit));

  const handleSubmit = useCallback(
    (nextQuery: string) => {
      const trimmed = nextQuery.trim();
      if (!trimmed) {
        return;
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("q", trimmed);
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  if (!query) {
    return null;
  }

  if (isError) {
    return (
      <span className="text-red-500">
        {(error as Error)?.message || "Impossible de récupérer les résultats"}
      </span>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:gap-8">
          <Link
            to={"/"}
            className="text-2xl transition hover:text-gray-800 cursor-pointer"
          >
            S3 Search
          </Link>
          <div className="flex-1">
            <Input
              handleSubmit={handleSubmit}
              initialValue={query}
              placeholder=""
              autoFocus
            />
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6 text-sm text-gray-600">
          {isLoading && <span>Recherche des résultats...</span>}
          {!isLoading && (
            <ResultMeta
              total={searchResult?.total_hits}
              took={searchResult?.took}
              isFetching={isFetching}
            />
          )}
        </div>

        {!isLoading && hits.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center text-gray-500">
            Aucun résultat pour{" "}
            <span className="font-medium text-gray-700">{query}</span>. Essayez
            une autre recherche.
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {hits.map((hit) => (
            <li
              key={hit.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <SearchHitCard hit={hit} query={query} />
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onChange={(nextPage) => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("q", query);
                next.set("page", String(nextPage));
                return next;
              });
            }}
          />
        )}
      </section>
    </main>
  );
};

export default SearchResult;

const parsePage = (raw: string | null) => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};
