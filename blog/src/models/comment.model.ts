export interface PaginatedComments {
    current_page: number;
    total_pages: number;
    total_count: number;
    next: string | null;
    previous: string | null;
    results: Comments_author[];
  }

export interface Comments_author {
    id:      number;
    user:    string;
    post:    string;
    post_id: number;
    content: string;
    created_at:    string;
}

