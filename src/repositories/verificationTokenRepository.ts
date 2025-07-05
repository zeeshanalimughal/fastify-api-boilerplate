import { db } from "../infrastructure/db";
import { verificationTokens, NewVerificationToken, VerificationToken } from "../entities/verificationToken";
import { eq } from "drizzle-orm";

export class VerificationTokenRepository {
  async create(data: NewVerificationToken): Promise<VerificationToken> {
    const [token] = await db.insert(verificationTokens).values(data).returning();
    return token;
  }

  async find(tokenStr: string): Promise<VerificationToken | undefined> {
    const [token] = await db.select().from(verificationTokens).where(eq(verificationTokens.token, tokenStr));
    return token;
  }

  async markUsed(id: number) {
    await db.update(verificationTokens).set({ used: true }).where(eq(verificationTokens.id, id));
  }
}
