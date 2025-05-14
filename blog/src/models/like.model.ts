import { LikesAuthor } from "./post.model";

export interface LikePaginationResponse {
    current_page: number;
    total_pages: number;
    total_count: number;
    next: string | null;
    previous: string | null;
    results: LikesAuthor[];
  }
  