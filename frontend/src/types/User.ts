export interface User {
  userId: number;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  bio: string | null;
  timeCreated: string;
}