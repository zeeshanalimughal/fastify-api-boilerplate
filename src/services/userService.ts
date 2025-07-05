import { UserRepository } from "../repositories/userRepository";
import { NewUser, User } from "../entities/user";

export class UserService {
  private repo = new UserRepository();

  create(data: NewUser): Promise<User> {
    return this.repo.create(data);
  }

  getAll(): Promise<User[]> {
    return this.repo.findAll();
  }

  getById(id: number): Promise<User | undefined> {
    return this.repo.findById(id);
  }

  update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    return this.repo.update(id, data);
  }

  delete(id: number): Promise<number> {
    return this.repo.delete(id);
  }
}
