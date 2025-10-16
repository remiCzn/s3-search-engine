import { Search, SendHorizonal } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";

type InputProps = {
  handleSubmit: (search: string) => void;
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

const Input = ({
  handleSubmit,
  initialValue = "",
  placeholder = "",
  autoFocus = false,
  className,
}: InputProps) => {
  const [search, setSearch] = useState<string>(initialValue);

  useEffect(() => {
    setSearch(initialValue);
  }, [initialValue]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(search);
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-full border border-gray-300 bg-white p-2.5 shadow-sm",
        className
      )}
    >
      <Search className="h-5 w-5 flex-shrink-0 text-gray-500" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-w-0 flex-1 border-none bg-transparent text-base focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Lancer la recherche"
        className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-700 transition hover:bg-gray-200"
      >
        <SendHorizonal className="h-5 w-5" />
      </button>
    </form>
  );
};

export default Input;
