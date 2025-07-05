import { db } from "../infrastructure/db";
import { refreshTokens, NewRefreshToken, RefreshToken } from "../entities/refreshToken";
import { eq } from "drizzle-orm";

export class RefreshTokenRepository {
  async create(data: NewRefreshToken): Promise<RefreshToken> {
    const [token] = await db.insert(refreshTokens).values(data).returning();
    return token;
  }

  async find(tokenStr: string): Promise<RefreshToken | undefined> {
    const [token] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, tokenStr));
    return token;
  }

  async revoke(id: number) {
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, id));
  }
}
