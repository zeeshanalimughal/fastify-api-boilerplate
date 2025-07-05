import { UserRepository } from "./../repositories/userRepository";
import { OAuthAccountRepository } from "../repositories/oauthAccountRepository";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { NewRefreshToken } from "../entities/refreshToken";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { env } from "../config/env";
import { oauthAccounts } from "../entities/oauthAccount";

function parseExpiration(str: string) {
  const match = str.match(/(\d+)([dhms])/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

export class OAuthService {
  private users = new UserRepository();
  private oauthRepo = new OAuthAccountRepository();
  private refreshRepo = new RefreshTokenRepository();

  async loginOrRegister(provider: string, providerId: string, profile: { email?: string; name?: string }) {
    // Check if account exists
    let account = await this.oauthRepo.findByProvider(provider, providerId);

    let userId: number;

    if (!account) {
      // If no account, handle user creation / linking
      let user = profile.email ? await this.users.findByEmail(profile.email) : undefined;

      if (!user) {
        user = await this.users.create({
          name: profile.name || "Unknown",
          email: profile.email || `${provider}-${providerId}@example.com`,
          password: "", // empty password for social accounts
        } as any);
      }

      await this.oauthRepo.create({
        provider,
        providerId,
        userId: user.id,
      });
      userId = user.id;
    } else {
      userId = account.userId;
    }

    return this.generateTokens(userId);
  }

  private async generateTokens(userId: number) {
    const access = generateAccessToken({ sub: userId });
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
