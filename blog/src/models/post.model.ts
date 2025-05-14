export interface PaginatedPosts {
    current_page: number;
    total_pages: number;
    total_count: number;
    next: string | null;
    previous: string | null;
    results: Post[];
  }

export interface Post{
    id:                   number;
    title:                string;
    content:              string;
    excerpt:              string;
    author:               string;
    created_at:           string;
    updated_at:           string;
    author_groups:        string[];
    public_access:        string;
    authenticated_access: string;
    group_access:         string;
    author_access:        string;
    likes_author:         LikesAuthor[];
    Comments_author:      CommentsAuthor[];
}

export interface CommentsAuthor {
    id:         number;
    user:       string;
    post:       string;
    post_id:    number;
    content:    string;
    created_at: string;
}

export interface LikesAuthor {
    id:      number;
    post:    string;
    post_id: number;
    user:    string;
}