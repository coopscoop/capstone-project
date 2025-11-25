export interface Post {
  postId: number;
  userId: number;
  title: string;
  description: string;
  numberOfLikes: number;
  code: string;
  created: string;
  lastEdited: string;
  tags: string[];
}