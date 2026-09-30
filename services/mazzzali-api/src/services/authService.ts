import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from '../../../shared/types/entities.js';
import { UnauthorizedError } from '../errors/appError.js';
import { UserRepository } from '../repositories/userRepository.js';
import type { IAuthService, LoginInput, RegisterInput, AuthSession } from './interfaces/IAuthService.js';

export class AuthService implements IAuthService {
  private readonly key: Uint8Array;

  constructor(
    private readonly users: UserRepository,
    private readonly secret: string,
    private readonly issuer: string,
    private readonly audience: string,
  ) {
    this.key = new TextEncoder().encode(secret);
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.users.create({ ...input, passwordHash });
    return { user, token: await this.issueToken(user) };
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const record = await this.users.findByEmailWithPassword(input.email);
    if (!record || !(await bcrypt.compare(input.password, record.passwordHash))) {
      throw new UnauthorizedError('Email or password is incorrect.');
    }
    return { user: record.user, token: await this.issueToken(record.user) };
  }

  async authenticate(token: string): Promise<User> {
    let userId: string;
    try {
      const { payload } = await jwtVerify(token, this.key, {
        algorithms: ['HS256'],
        issuer: this.issuer,
        audience: this.audience,
      });
      if (!payload.sub || !isUuid(payload.sub)) throw new UnauthorizedError();
      userId = payload.sub;
    } catch {
      throw new UnauthorizedError();
    }
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedError();
    return user;
  }

  private issueToken(user: User): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(this.key);
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}