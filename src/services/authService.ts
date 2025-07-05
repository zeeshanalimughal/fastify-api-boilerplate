import { UserRepository } from "../repositories/userRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { hashPassword, verifyPassword } from "../utils/hash";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { Errors } from "../constants/errors";
import { RegisterInput, LoginInput } from "../validators/authSchema";
import { NewRefreshToken } from "../entities/refreshToken";
import { env } from "../config/env";

function parseExpiration(str: string) {
  const match = str.match(/(\d+)([dhms])/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

export class AuthService {
  private users = new UserRepository();
  private refreshRepo = new RefreshTokenRepository();

  async register(data: RegisterInput) {
    const hashed = await hashPassword(data.password);
    const user = await this.users.create({ ...data, password: hashed });

    import("./email").then(async ({ EmailService }) => {
      const emailService = new EmailService();
      try {
        await emailService.sendEmail({
          to: user.email,
          template: "WELCOME",
          variables: { name: user.name },
        });
      } catch (e) {
        console.error("Failed to send welcome email", e);
      }
    });

    return this.generateTokens(user.id, user.role);
  }

  async login(data: LoginInput) {
    const user = await this.users.findByEmail(data.email);
    if (!user) throw new Error(Errors.INVALID_CREDENTIALS);
    const valid = await verifyPassword(data.password, user.password);
    if (!valid) throw new Error(Errors.INVALID_CREDENTIALS);
    return this.generateTokens(user.id, user.role);
  }

  async refresh(oldToken: string) {
    const stored = await this.refreshRepo.find(oldToken);
    if (!stored || stored.revoked) throw new Error(Errors.REFRESH_REVOKED);
    if (stored.expiresAt < new Date()) throw new Error(Errors.TOKEN_EXPIRED);
    await this.refreshRepo.revoke(stored.id);
    return this.generateTokens(stored.userId, undefined);
  }

  private async generateTokens(userId: number, role?: string) {
    const access = generateAccessToken({ sub: userId, role });
    const refresh = generateRefreshToken({ sub: userId });
    const payload: NewRefreshToken = {
      token: refresh,
      userId,
      expiresAt: new Date(Date.now() + parseExpiration(env.REFRESH_TOKEN_EXPIRES_IN)),
    } as any;
    await this.refreshRepo.create(payload);
    return { accessToken: access, refreshToken: refresh };
  }
}
