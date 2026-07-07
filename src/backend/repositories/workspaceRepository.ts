import { db } from "../database/db";
import { Workspace, UserRole } from "../../types";

export class WorkspaceRepository {
  async getAll(): Promise<Workspace[]> {
    return db.workspaces;
  }

  async getById(id: string): Promise<Workspace | null> {
    return db.workspaces.find(w => w.id === id) || null;
  }

  async create(workspace: Workspace): Promise<Workspace> {
    const updated = [...db.workspaces, workspace];
    db.workspaces = updated;
    return workspace;
  }

  async update(id: string, name: string, description: string): Promise<Workspace | null> {
    const workspaces = db.workspaces;
    const index = workspaces.findIndex(w => w.id === id);
    if (index === -1) return null;

    const updatedWorkspace = { ...workspaces[index], name, description };
    const updatedWorkspaces = [...workspaces];
    updatedWorkspaces[index] = updatedWorkspace;
    db.workspaces = updatedWorkspaces;

    return updatedWorkspace;
  }

  async delete(id: string): Promise<boolean> {
    const workspaces = db.workspaces;
    const beforeLength = workspaces.length;
    const filtered = workspaces.filter(w => w.id !== id);
    db.workspaces = filtered;
    return filtered.length < beforeLength;
  }

  async addMember(workspaceId: string, userId: string, role: UserRole): Promise<Workspace | null> {
    const workspaces = db.workspaces;
    const index = workspaces.findIndex(w => w.id === workspaceId);
    if (index === -1) return null;

    const workspace = workspaces[index];
    const isMember = workspace.members.some(m => m.userId === userId);
    if (isMember) return workspace;

    const updatedWorkspace = {
      ...workspace,
      members: [...workspace.members, { userId, role }]
    };

    const updatedWorkspaces = [...workspaces];
    updatedWorkspaces[index] = updatedWorkspace;
    db.workspaces = updatedWorkspaces;

    return updatedWorkspace;
  }

  async removeMember(workspaceId: string, userId: string): Promise<Workspace | null> {
    const workspaces = db.workspaces;
    const index = workspaces.findIndex(w => w.id === workspaceId);
    if (index === -1) return null;

    const workspace = workspaces[index];
    const updatedWorkspace = {
      ...workspace,
      members: workspace.members.filter(m => m.userId !== userId)
    };

    const updatedWorkspaces = [...workspaces];
    updatedWorkspaces[index] = updatedWorkspace;
    db.workspaces = updatedWorkspaces;

    return updatedWorkspace;
  }
}

export const workspaceRepository = new WorkspaceRepository();
