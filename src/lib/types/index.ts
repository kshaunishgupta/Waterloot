export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: "student" | "admin";
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  parent_id: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  condition: "new" | "like_new" | "good" | "fair";
  status: "active" | "sold" | "removed" | "draft";
  images: string[];
  isbn: string | null;
  book_title: string | null;
  book_author: string | null;
  book_edition: string | null;
  course_code: string | null;
  instagram: string | null;
  discord: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingWithDetails extends Listing {
  seller: Profile;
  category: Category;
  is_saved?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  status: string;
  isbn: string | null;
  book_title: string | null;
  book_author: string | null;
  book_edition: string | null;
  course_code: string | null;
  seller_id: string;
  seller_name: string;
  seller_avatar: string | null;
  category_id: string;
  category_name: string;
  category_slug: string;
  created_at: string;
  total_count: number;
}

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string | null;
  reported_user_id: string | null;
  reason: "spam" | "inappropriate" | "scam" | "prohibited_item" | "harassment" | "other";
  description: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  admin_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface ISBNLookupResult {
  title: string;
  author: string;
  edition: string;
  coverUrl: string | null;
  publishDate: string;
  publishers: string[];
}

export interface WantedPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: "active" | "fulfilled" | "closed";
  created_at: string;
  updated_at: string;
}

export interface WantedPostWithDetails extends WantedPost {
  user: Profile;
  category: Category | null;
}

export interface SellerRating {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string | null;
  is_like: boolean;
  created_at: string;
}

export interface SellerApproval {
  total_ratings: number;
  like_count: number;
  approval_pct: number | null;
}
