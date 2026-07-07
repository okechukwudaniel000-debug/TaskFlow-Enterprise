import { workspaceRepository } from "../repositories/workspaceRepository";
import { userRepository } from "../repositories/userRepository";
import { Workspace, UserRole } from "../../types";

export class WorkspaceService {
  async getWorkspaces(): Promise<Workspace[]> {
    return await workspaceRepository.getAll();
  }

  async createWorkspace(name: string, description: string, ownerId: string): Promise<Workspace> {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      description,
      ownerId,
      members: [{ userId: ownerId, role: UserRole.ADMIN }]
    };
    return await workspaceRepository.create(newWs);
  }

  async updateWorkspace(id: string, name: string, description: string): Promise<Workspace | null> {
    return await workspaceRepository.update(id, name, description);
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    return await workspaceRepository.delete(id);
  }

  async inviteMember(workspaceId: string, email: string, role: UserRole): Promise<Workspace | null> {
    let user = await userRepository.getByEmail(email);
    if (!user) {
      // Create invited user profile
      const name = email.split("@")[0];
      user = await userRepository.create({
        id: `user-${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
        bio: "Invited Workspace Collaborator",
        role,
        timezone: "America/Los_Angeles",
        language: "en",
        theme: "dark",
        isOnline: false
      });
    }

    return await workspaceRepository.addMember(workspaceId, user.id, role);
  }

  async removeMember(workspaceId: string, userId: string): Promise<Workspace | null> {
    return await workspaceRepository.removeMember(workspaceId, userId);
  }
}

export const workspaceService = new WorkspaceService();
