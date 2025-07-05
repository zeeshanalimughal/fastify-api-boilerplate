import { db } from "../infrastructure/db";
import { oauthAccounts, NewOAuthAccount, OAuthAccount } from "../entities/oauthAccount";
import { eq, and } from "drizzle-orm";

export class OAuthAccountRepository {
  async create(data: NewOAuthAccount): Promise<OAuthAccount> {
    const [rec] = await db.insert(oauthAccounts).values(data).returning();
    return rec;
  }

  async findByProvider(provider: string, providerId: string): Promise<OAuthAccount | undefined> {
    const [rec] = await db
      .select()
      .from(oauthAccounts)
      .where(and(eq(oauthAccounts.provider, provider), eq(oauthAccounts.providerId, providerId)));
    return rec;
  }
}
