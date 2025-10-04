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
    <main className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="container mx-auto flex h-full flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl">S3 Search</h1>
        <p className="text-base font-light">
          Create a query on the S3 bucket and display the results
        </p>
        <Input handleSubmit={handleSubmit} />
      </div>
    </main>
  );
}
