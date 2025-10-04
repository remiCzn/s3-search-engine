import { Search, SendHorizonal } from "lucide-react";
import { useEffect, useState } from "react";

type InputProps = {
  handleSubmit: (search: string) => void;
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

const Input = ({
  handleSubmit,
  initialValue = "",
  placeholder = "",
  autoFocus = false,
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
      className="flex gap-2 flex-rows items-center rounded-full border border-gray-300 p-2.5 shadow-sm bg-white"
    >
      <Search className="w-9" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="focus:outline-none flex-1 min-w-96"
      />
      <button className="cursor-pointer bg-gray-300 text-gray-700 rounded-full p-2 hover:bg-gray-200 size-9 flex items-center justify-center">
        <SendHorizonal className="w-5" />
      </button>
    </form>
  );
};

export default Input;
