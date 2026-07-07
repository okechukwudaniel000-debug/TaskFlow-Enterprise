import { userRepository } from "../repositories/userRepository";
import { User, UserRole } from "../../types";

export class AuthService {
  async authenticate(email: string): Promise<User> {
    const existingUser = await userRepository.getByEmail(email);
    if (existingUser) {
      // Simulate setting online
      await userRepository.update(existingUser.id, { isOnline: true });
      return { ...existingUser, isOnline: true };
    }

    // Dynamic sign-up for workspace onboarding
    const name = email.split("@")[0];
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
      bio: "Enterprise Platform Engineer",
      role: UserRole.MEMBER,
      timezone: "America/Los_Angeles",
      language: "en",
      theme: "dark",
      isOnline: true
    };

    return await userRepository.create(newUser);
  }

  async logout(userId: string): Promise<void> {
    await userRepository.update(userId, { isOnline: false });
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
    return await userRepository.update(userId, data);
  }

  async getAllUsers(): Promise<User[]> {
    return await userRepository.getAll();
  }
}

export const authService = new AuthService();
