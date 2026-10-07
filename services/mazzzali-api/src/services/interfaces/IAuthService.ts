import type { User } from '../../../../shared/types/entities.js';

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface IAuthService {
  register(input: RegisterInput): Promise<AuthSession>;
  login(input: LoginInput): Promise<AuthSession>;
  authenticate(token: string): Promise<User>;
}