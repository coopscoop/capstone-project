export interface CreatePostRequest {
  userId: number;
  title: string;
  description: string;
  code: string;
  numberOfLikes: number;
}