import { ReactNode } from "react";

export const parseS3Identifier = (identifier: string) => {
  const [bucket, ...rest] = identifier.split(":");
  return {
    bucket: bucket || "bucket",
    key: rest.length > 0 ? rest.join(":") : bucket,
  };
};

export const createSnippet = (text: string, query: string) => {
  if (!text) {
    return "";
  }
  if (!query) {
    return truncate(text, 220);
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return truncate(text, 220);
  }

  const start = Math.max(index - 80, 0);
  const end = Math.min(index + query.length + 120, text.length);
  const prefix = start > 0 ? "… " : "";
  const suffix = end < text.length ? " …" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
};

export const truncate = (value: string, length: number) => {
  if (value.length <= length) {
    return value;
  }
  return `${value.slice(0, length)} …`;
};

export const highlight = (text: string, term: string): ReactNode => {
  const trimmed = term.trim();
  if (!trimmed) {
    return text;
  }

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  const normalized = trimmed.toLowerCase();

  return parts.map((part, index) => {
    const isMatch = index % 2 === 1 && part.toLowerCase() === normalized;
    if (!isMatch) {
      return <span key={`${index}-${part}`}>{part}</span>;
    }
    return (
      <mark
        key={`${index}-${part}`}
        className="rounded bg-yellow-200 px-0.5 py-0.5"
      >
        {part}
      </mark>
    );
  });
};
