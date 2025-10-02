import { useCallback, useState } from "react";
import Input from "./ui/input";

export default function App() {
  const [search, setSearch] = useState<string>("");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log(search);
    },
    [search]
  );

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="container mx-auto flex h-full flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl">Recherche S3</h1>
        <p className="text-base font-light">
          Lancer une requête sur le bucket S3 et afficher les résultats
        </p>
        <Input handleSubmit={handleSubmit} />
      </div>
    </main>
  );
}
