export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
] as const;

export const LOCATION_TYPES = [
  { value: "on_campus", label: "On Campus" },
  { value: "off_campus", label: "Off Campus" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "relevance", label: "Most Relevant" },
] as const;

export const DATE_FILTERS = [
  { value: "", label: "Any Time" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
] as const;

export const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "scam", label: "Scam / Fraud" },
  { value: "prohibited_item", label: "Prohibited Item" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
] as const;

export const MAX_IMAGES = 6;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LISTINGS_PER_PAGE = 20;
