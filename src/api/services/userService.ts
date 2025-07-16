import type { User, NewUser } from "../../types";

export class UserService {
  async create(_input: NewUser): Promise<User> {
    // ... your logic ...
    throw new Error("Not implemented");
  }

  async getAll(): Promise<User[]> {
    // ... your logic ...
    throw new Error("Not implemented");
  }

  async getById(_id: number): Promise<User | null> {
    // ... your logic ...
    throw new Error("Not implemented");
  }

  async update(_id: number, _input: Partial<NewUser>): Promise<User | null> {
    // ... your logic ...
    throw new Error("Not implemented");
  }

  async delete(_id: number): Promise<boolean> {
    // ... your logic ...
    throw new Error("Not implemented");
  }
}
