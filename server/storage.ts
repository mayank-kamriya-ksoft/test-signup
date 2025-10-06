import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if email already exists
    const existingUser = await this.getUserByEmail(insertUser.email);
    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const id = randomUUID();
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      password: hashedPassword,
      verified: false,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
