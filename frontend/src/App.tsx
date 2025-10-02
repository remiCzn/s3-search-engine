import { Search, SendHorizonal } from "lucide-react";

export default function App() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="container mx-auto flex h-full flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl">Recherche S3</h1>
        <p className="text-base font-light">
          Lancer une requête sur le bucket S3 et afficher les résultats
        </p>
        <div className="flex gap-2 flex-rows items-center rounded-full border border-gray-300 p-2.5 shadow-sm">
          <Search className="w-9" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="focus:outline-none flex-1 min-w-96"
          />
          <button className="cursor-pointer bg-gray-300 text-gray-700 rounded-full p-2 hover:bg-gray-200 size-9 flex items-center justify-center">
            <SendHorizonal className="w-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
