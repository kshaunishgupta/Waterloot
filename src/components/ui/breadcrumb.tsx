import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-0 text-xs font-medium"
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center">
            {i > 0 && (
              <span className="mx-2 select-none text-neutral-700">›</span>
            )}
            {seg.href ? (
              <Link
                href={seg.href}
                className="text-neutral-500 transition-colors hover:text-neutral-200"
              >
                {seg.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast ? "text-neutral-200" : "text-neutral-400"
                )}
              >
                {seg.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
