import { db } from "../../db/connection";
import { refreshTokens, NewRefreshToken, RefreshToken } from "../entities/refreshToken";
import { users } from "../entities/user";
import { eq, and, sql, count, lte } from "drizzle-orm";

export class RefreshTokenRepository {
  async create(data: NewRefreshToken): Promise<RefreshToken> {
    const result = await db.insert(refreshTokens).values(data).returning();
    return result[0];
  }

  async find(tokenStr: string): Promise<RefreshToken | undefined> {
    const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, tokenStr));
    return result[0];
  }

  async findValidToken(tokenStr: string): Promise<RefreshToken | undefined> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, tokenStr),
          eq(refreshTokens.revoked, false),
          sql`${refreshTokens.expiresAt} > NOW()`,
        ),
      );
    return result[0];
  }

  async revoke(id: number): Promise<void> {
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, id));
  }

  async revokeByUserId(userId: number): Promise<void> {
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await db.delete(refreshTokens).where(lte(refreshTokens.expiresAt, new Date()));
    return result.rowCount ?? 0;
  }

  async getTokenCountByUser(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)));
    return result[0].count;
  }

  async getActiveTokensByUser(userId: number): Promise<RefreshToken[]> {
    return db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.revoked, false),
          sql`${refreshTokens.expiresAt} > NOW()`,
        ),
      )
      .orderBy(sql`${refreshTokens.createdAt} DESC`);
  }

  async getTokensWithUserInfo(): Promise<
    Array<RefreshToken & { userName: string; userEmail: string }>
  > {
    const result = await db
      .select({
        id: refreshTokens.id,
        token: refreshTokens.token,
        userId: refreshTokens.userId,
        expiresAt: refreshTokens.expiresAt,
        revoked: refreshTokens.revoked,
        createdAt: refreshTokens.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(refreshTokens)
      .leftJoin(users, eq(refreshTokens.userId, users.id));

    return result as Array<RefreshToken & { userName: string; userEmail: string }>;
  }
}
