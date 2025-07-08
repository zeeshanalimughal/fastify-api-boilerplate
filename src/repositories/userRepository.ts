import { db } from "../infrastructure/db";
import { users, NewUser, User } from "../entities/user";
import { eq, count, sql } from "drizzle-orm";

export class UserRepository {
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findAll(): Promise<User[]> {
    return db.select().from(users);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async findById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async markEmailAsVerified(id: number): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updatePassword(id: number, hashedPassword: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<number> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ?? 0;
  }

  // New aggregation methods
  async getTotalUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  }

  async getUsersWithPagination(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * pageSize;

    const [usersResult, totalResult] = await Promise.all([
      db.select().from(users).limit(pageSize).offset(offset),
      db.select({ count: count() }).from(users),
    ]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / pageSize);

    return {
      users: usersResult,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getUserStatsByRole(): Promise<{ role: string; count: number }[]> {
    const result = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role);

    return result;
  }

  async getRecentUsers(limit: number = 10): Promise<User[]> {
    return db
      .select()
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(limit);
  }

  async searchUsersByName(searchTerm: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(sql`${users.name} ILIKE ${`%${searchTerm}%`}`);
  }

  async searchUsersByEmail(searchTerm: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(sql`${users.email} ILIKE ${`%${searchTerm}%`}`);
  }

  async getUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(sql`${users.createdAt} BETWEEN ${startDate} AND ${endDate}`);
  }
}
