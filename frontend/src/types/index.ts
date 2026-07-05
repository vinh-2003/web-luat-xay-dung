export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  bookmarkedIds: number[];
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  toggleBookmarkState: (id: number) => void;
  isLoading: boolean;
}

export type SearchFilters = {
  query: string;
  doc_types: string[];
  statuses: string[];
  issuing_bodies: string[];
  issue_date_from: string;
  issue_date_to: string;
  effective_date_from: string;
  effective_date_to: string;
};

export interface Document {
  id: number;
  number: string;
  title: string;
  date: string;
  status: string;
  type: string;
  signer: string | null;
  issuing_body: string | null;
  origin_url: string;
}

export interface PaginationData {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
}

export interface SearchResponse {
  data: Document[];
  pagination: PaginationData;
  message: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}
