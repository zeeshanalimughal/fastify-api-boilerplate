import { db } from "../infrastructure/db";
import {
  verificationTokens,
  NewVerificationToken,
  VerificationToken,
} from "../entities/verificationToken";
import { users } from "../entities/user";
import { eq, and, sql, count, lte, desc } from "drizzle-orm";
import { TokenType } from "../constants/tokens";

export class VerificationTokenRepository {
  async create(data: NewVerificationToken): Promise<VerificationToken> {
    const result = await db.insert(verificationTokens).values(data).returning();
    return result[0];
  }

  async findByToken(tokenStr: string): Promise<VerificationToken | undefined> {
    const result = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, tokenStr));
    return result[0];
  }

  async findValidToken(tokenStr: string): Promise<VerificationToken | undefined> {
    const result = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, tokenStr),
          eq(verificationTokens.used, false),
          sql`${verificationTokens.expiresAt} > NOW()`,
        ),
      );
    return result[0];
  }

  async findByUserIdAndType(
    userId: number,
    type: TokenType,
  ): Promise<VerificationToken | undefined> {
    const result = await db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.userId, userId), eq(verificationTokens.type, type)))
      .orderBy(desc(verificationTokens.createdAt))
      .limit(1);
    return result[0];
  }

  async findValidTokenByUserIdAndType(
    userId: number,
    type: TokenType,
  ): Promise<VerificationToken | undefined> {
    const result = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, userId),
          eq(verificationTokens.type, type),
          eq(verificationTokens.used, false),
          sql`${verificationTokens.expiresAt} > NOW()`,
        ),
      )
      .orderBy(desc(verificationTokens.createdAt))
      .limit(1);
    return result[0];
  }

  async markUsed(id: number): Promise<void> {
    await db.update(verificationTokens).set({ used: true }).where(eq(verificationTokens.id, id));
  }

  async deleteByUserId(userId: number, type: TokenType): Promise<void> {
    await db
      .delete(verificationTokens)
      .where(and(eq(verificationTokens.userId, userId), eq(verificationTokens.type, type)));
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await db
      .delete(verificationTokens)
      .where(lte(verificationTokens.expiresAt, new Date()));
    return result.rowCount ?? 0;
  }

  async getTokenCountByType(type: TokenType): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(verificationTokens)
      .where(eq(verificationTokens.type, type));
    return result[0].count;
  }

  async getTokenCountByUser(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(verificationTokens)
      .where(eq(verificationTokens.userId, userId));
    return result[0].count;
  }

  async getActiveTokensByUser(userId: number): Promise<VerificationToken[]> {
    return db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, userId),
          eq(verificationTokens.used, false),
          sql`${verificationTokens.expiresAt} > NOW()`,
        ),
      )
      .orderBy(desc(verificationTokens.createdAt));
  }

  async getTokensWithUserInfo(): Promise<
    Array<VerificationToken & { userName: string; userEmail: string }>
  > {
    const result = await db
      .select({
        id: verificationTokens.id,
        token: verificationTokens.token,
        userId: verificationTokens.userId,
        type: verificationTokens.type,
        expiresAt: verificationTokens.expiresAt,
        used: verificationTokens.used,
        createdAt: verificationTokens.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(verificationTokens)
      .leftJoin(users, eq(verificationTokens.userId, users.id))
      .orderBy(desc(verificationTokens.createdAt));

    return result as Array<VerificationToken & { userName: string; userEmail: string }>;
  }

  async getTokenStatsByType(): Promise<
    Array<{ type: string; total: number; active: number; expired: number }>
  > {
    const result = await db
      .select({
        type: verificationTokens.type,
        total: count(),
        active: sql<number>`COUNT(CASE WHEN ${verificationTokens.used} = false AND ${verificationTokens.expiresAt} > NOW() THEN 1 END)`,
        expired: sql<number>`COUNT(CASE WHEN ${verificationTokens.expiresAt} <= NOW() THEN 1 END)`,
      })
      .from(verificationTokens)
      .groupBy(verificationTokens.type);

    return result;
  }

  async cleanupUsedTokens(): Promise<number> {
    const result = await db.delete(verificationTokens).where(eq(verificationTokens.used, true));
    return result.rowCount ?? 0;
  }
}
