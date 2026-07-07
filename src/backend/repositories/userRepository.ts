import { db } from "../database/db";
import { User } from "../../types";

export class UserRepository {
  async getAll(): Promise<User[]> {
    return db.users;
  }

  async getById(id: string): Promise<User | null> {
    return db.users.find(u => u.id === id) || null;
  }

  async getByEmail(email: string): Promise<User | null> {
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async create(user: User): Promise<User> {
    const updated = [...db.users, user];
    db.users = updated;
    return user;
  }

  async update(id: string, updatedData: Partial<User>): Promise<User | null> {
    const users = db.users;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const updatedUser = { ...users[index], ...updatedData };
    const updatedUsers = [...users];
    updatedUsers[index] = updatedUser;
    db.users = updatedUsers;

    return updatedUser;
  }
}

export const userRepository = new UserRepository();
