export interface Post {
  title: string;
  url: string;
  publishedAt: string;
  description: string;
  tags: string[];
}

export interface PostDetail extends Post {
  content: string;
}
