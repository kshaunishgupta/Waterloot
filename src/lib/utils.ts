type ClassValue = string | number | boolean | undefined | null | Record<string, boolean | undefined | null> | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  let result = "";
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      result += (result ? " " : "") + input;
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) result += (result ? " " : "") + inner;
    } else if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) {
          result += (result ? " " : "") + key;
        }
      }
    }
  }
  return result;
}

export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatCondition(condition: string): string {
  const map: Record<string, string> = {
    new: "New",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
  };
  return map[condition] || condition;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
