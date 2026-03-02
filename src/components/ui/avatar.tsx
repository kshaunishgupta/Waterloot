"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
} as const;

type AvatarSize = keyof typeof sizeStyles;

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const showImage = src && !imgError;
  const initials = fallback || alt?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300",
        sizeStyles[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

export { Avatar };
