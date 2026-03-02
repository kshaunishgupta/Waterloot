import Link from "next/link";

function buildPageList(current: number, total: number): (number | "...")[] {
  const nums = new Set<number>([1, total]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) nums.add(i);
  }
  const sorted = Array.from(nums).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

const navClass =
  "border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white";
const numClass =
  "border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800";
const activeClass =
  "border border-primary-600 bg-primary-600 px-3 py-1.5 text-sm font-bold text-white pointer-events-none";
const disabledClass =
  "border border-neutral-800 px-3 py-1.5 text-sm text-neutral-700 cursor-default select-none";

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={navClass}>previous</Link>
      ) : (
        <span className={disabledClass}>previous</span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-1.5 py-1.5 text-sm text-neutral-600 select-none">...</span>
        ) : p === page ? (
          <span key={p} className={activeClass}>{p}</span>
        ) : (
          <Link key={p} href={buildHref(p as number)} className={numClass}>{p}</Link>
        )
      )}

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={navClass}>next</Link>
      ) : (
        <span className={disabledClass}>next</span>
      )}
    </div>
  );
}
