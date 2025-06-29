import {
  bills,
  users,
  categories,
  type Bill,
  type InsertBill,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(userData: { email: string; password: string; firstName: string; lastName?: string }): Promise<User>;
  validatePassword(userId: string, password: string): Promise<boolean>;
  
  // Category operations
  getUserCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory, userId: string): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>, userId: string): Promise<Category | undefined>;
  deleteCategory(id: number, userId: string): Promise<boolean>;
  
  // Bill operations
  getBill(id: number, userId: string): Promise<Bill | undefined>;
  getAllBills(userId: string): Promise<Bill[]>;
  createBill(bill: InsertBill, userId: string): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>, userId: string): Promise<Bill | undefined>;
  deleteBill(id: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLocalUser(userData: { email: string; password: string; firstName: string; lastName?: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        authProvider: "local",
      })
      .returning();

    return user;
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.password) return false;
    return await bcrypt.compare(password, user.password);
  }



  // Category operations
  async getUserCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  }

  async createCategory(categoryData: InsertCategory, userId: string): Promise<Category> {
    const [category] = await db.insert(categories).values({
      ...categoryData,
      userId,
    }).returning();
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>, userId: string): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updateData)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return category;
  }

  async deleteCategory(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Bill operations
  async getBill(id: number, userId: string): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill && bill.userId === userId ? bill : undefined;
  }

  async getAllBills(userId: string): Promise<Bill[]> {
    return await db.select().from(bills)
      .where(eq(bills.userId, userId))
      .orderBy(bills.dueDate);
  }

  async createBill(insertBill: InsertBill, userId: string): Promise<Bill> {
    const billData = {
      ...insertBill,
      userId,
    };
    
    // Auto-determine status based on due date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(insertBill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (billData.status === "unpaid" && dueDate < today) {
      billData.status = "overdue";
    }
    
    const [bill] = await db.insert(bills).values(billData).returning();
    return bill;
  }

  async updateBill(id: number, updateData: Partial<InsertBill>, userId: string): Promise<Bill | undefined> {
    // Auto-determine status based on due date if status is being updated or due date changed
    if (updateData.dueDate || updateData.status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(updateData.dueDate || "");
      dueDate.setHours(0, 0, 0, 0);
      
      if (updateData.status === "unpaid" && dueDate < today) {
        updateData.status = "overdue";
      }
    }

    const [bill] = await db
      .update(bills)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(bills.id, id))
      .returning();
    
    return bill && bill.userId === userId ? bill : undefined;
  }

  async deleteBill(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(bills).where(eq(bills.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
