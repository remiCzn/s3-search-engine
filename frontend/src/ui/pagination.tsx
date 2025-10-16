import { PropsWithChildren } from "react";
import { cn } from "../lib/cn";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

const computePages = (current: number, total: number) => {
  const maxDisplayed = 7;
  if (total <= maxDisplayed) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }

  const half = Math.floor(maxDisplayed / 2);
  let start = Math.max(current - half, 1);
  let end = start + maxDisplayed - 1;

  if (end > total) {
    end = total;
    start = end - maxDisplayed + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
};

const Pagination = ({ currentPage, totalPages, onChange }: PaginationProps) => {
  const pages = computePages(currentPage, totalPages);

  return (
    <nav className="mt-10 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-gray-600">
        <PaginationButton
          onClick={() => onChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </PaginationButton>
        {pages.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            onClick={() => onChange(pageNumber)}
            className={cn(
              `cursor-pointer rounded-full size-9 px-2 py-2 aspect-square text-sm font-medium transition`,
              pageNumber === currentPage
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-200"
            )}
          >
            {pageNumber}
          </button>
        ))}
        <PaginationButton
          onClick={() => onChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Suivant
        </PaginationButton>
      </div>
      <span className="text-xs text-gray-500">
        Page {currentPage} sur {totalPages}
      </span>
    </nav>
  );
};

type PaginationButtonProps = {
  onClick: () => void;
  disabled: boolean;
};

const PaginationButton = ({
  onClick,
  disabled,
  children,
}: PropsWithChildren<PaginationButtonProps>) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-shrink-0 rounded-full px-4 py-2 font-medium transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
    >
      {children}
    </button>
  );
};

export default Pagination;
