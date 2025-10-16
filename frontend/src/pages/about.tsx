import React from "react";

const About: React.FC = () => (
  <main className="bg-gray-100">
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900">About</h1>

      <div className="mt-6 space-y-6 text-gray-700">
        <p>
          This application is a small search engine built to index and search
          objects stored in an S3-compatible bucket (MinIO is used during
          development). It provides a lightweight backend that reads an on-disk
          index and serves search results via an HTTP API, and a React frontend
          that queries that API and shows paginated results.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            High-level architecture
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Backend (Go): builds/loads an index from a local index path and
              exposes REST endpoints for searching and health checks.
            </li>
            <li>
              Storage: objects and raw data are stored in an S3-compatible
              bucket. A separate index store contains metadata and columnar
              search data used by the indexer and query engine.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Datasets</h2>
          <p>
            During development, the backend is tested against a MinIO server.
            These datasets are used to populate the index and test the search
            functionality:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <a
                href="https://www.ietf.org/process/rfcs/"
                className="text-gray-900 underline decoration-gray-400 transition hover:decoration-gray-600"
              >
                IETF RFCs
              </a>
            </li>
            <li>
              <a
                href="https://github.com/rust-lang/rfcs"
                className="text-gray-900 underline decoration-gray-400 transition hover:decoration-gray-600"
              >
                Rust RFCs
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
);

export default About;
