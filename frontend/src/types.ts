export type Book = {
  id: number;
  title: string;
  author: string;
  description?: string;
  publishedYear: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  message: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginData = {
  email: string;
  password: string;
};
