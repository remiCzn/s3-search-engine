import { Search, SendHorizonal } from "lucide-react";
import { useState } from "react";

type InputProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const Input = ({ handleSubmit }: InputProps) => {
  const [search, setSearch] = useState<string>("");
  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 flex-rows items-center rounded-full border border-gray-300 p-2.5 shadow-sm"
    >
      <Search className="w-9" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher..."
        className="focus:outline-none flex-1 min-w-96"
      />
      <button className="cursor-pointer bg-gray-300 text-gray-700 rounded-full p-2 hover:bg-gray-200 size-9 flex items-center justify-center">
        <SendHorizonal className="w-5" />
      </button>
    </form>
  );
};

export default Input;
