export interface CreatePostRequest {
  userId: number;
  title: string;
  description: string;
  code: string;
  isVisible: boolean;
  tags: string[];
  numberOfLikes: number;
}