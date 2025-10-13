import React from "react";

const About: React.FC = () => (
  <div style={{ padding: "2rem", maxWidth: 960 }}>
    <h1 className="text-3xl">About</h1>

    <p>
      This application is a small search engine built to index and search
      objects stored in an S3-compatible bucket (MinIO is used during
      development). It provides a lightweight backend that reads an on-disk
      index and serves search results via an HTTP API, and a React frontend that
      queries that API and shows paginated results.
    </p>

    <h2 className="text-2xl">High-level architecture</h2>
    <ul>
      <li>
        Backend (Go): builds/loads an index from a local index path and exposes
        REST endpoints for searching and health checks.
      </li>
      <li>
        Storage: objects and raw data are stored in an S3-compatible bucket. A
        separate index store contains metadata and columnar search data used by
        the indexer and query engine.
      </li>
    </ul>

    <h2 className="text-2xl">Datasets</h2>
    <p>During development, the backend is tested against a MinIO server</p>
    <p>
      These datasets are used to populate the index and test the search
      functionality:
    </p>
    <ul>
      <li>
        <a href="https://www.ietf.org/process/rfcs/">IETF RFCs</a>
      </li>
      <li>
        <a href="https://github.com/rust-lang/rfcs">Rust RFCs</a>
      </li>
    </ul>
  </div>
);

export default About;
