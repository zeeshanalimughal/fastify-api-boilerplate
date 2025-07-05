import { db } from "../infrastructure/db";
import { users, NewUser, User } from "../entities/user";
import { eq } from "drizzle-orm";

export class UserRepository {
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findAll(): Promise<User[]> {
    return db.select().from(users);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: number): Promise<number> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ?? 0;
  }
}
