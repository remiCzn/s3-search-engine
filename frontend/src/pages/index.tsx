import { useCallback } from "react";
import Input from "../ui/input";
import { useNavigate } from "react-router";

export default function Index() {
  const nav = useNavigate();

  const handleSubmit = useCallback(
    (search: string) => {
      nav(`/search-result?q=${search}`);
    },
    [nav]
  );

  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-6 text-center">
          <h1 className="text-3xl">S3 Search</h1>
          <p className="text-base font-light">
            Create a query on the S3 bucket and display the results
          </p>
          <Input handleSubmit={handleSubmit} />
        </div>
      </div>
      <div className="mt-auto px-4 pb-6 text-center text-sm text-gray-600">
        <a href="/about" className="transition hover:text-gray-800">
          about
        </a>
      </div>
    </main>
  );
}
