export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  role: string;
  shopIds: number[];
}