import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

type SearchQueryOptions = {
  query: string;
  from?: number;
  limit?: number;
};

export const useSearch = ({ query, from = 0, limit = 20 }: SearchQueryOptions) => {
  return useQuery({
    queryKey: ["search", query, from, limit],
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await axios.get("/api/search", {
        params: { q: query, from, limit },
      });
      return res.data;
    },
  });
};
