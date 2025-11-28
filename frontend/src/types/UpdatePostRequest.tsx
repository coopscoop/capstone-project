export interface UpdatePostRequest {
  postId: number;
  userId: number;
  title: string;
  description: string;
  code: string;
  numberOfLikes: number;
  tags: string[];
}