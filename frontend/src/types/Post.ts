export interface Post {
  postId: number;
  userId: number;
  title: string;
  description: string;
  numberOfLikes: number;
  code: string;
  created: string;
  isVisible: boolean;
  lastEdited: string;
  tags: string[];
}