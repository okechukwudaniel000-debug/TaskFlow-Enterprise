import { db } from "../database/db";
import { Sprint } from "../../types";

export class SprintRepository {
  async getAll(): Promise<Sprint[]> {
    return db.sprints;
  }

  async getById(id: string): Promise<Sprint | null> {
    return db.sprints.find(s => s.id === id) || null;
  }

  async getByWorkspace(workspaceId: string): Promise<Sprint[]> {
    return db.sprints.filter(s => s.workspaceId === workspaceId);
  }

  async create(sprint: Sprint): Promise<Sprint> {
    const updated = [...db.sprints, sprint];
    db.sprints = updated;
    return sprint;
  }

  async update(id: string, updatedData: Partial<Sprint>): Promise<Sprint | null> {
    const sprints = db.sprints;
    const index = sprints.findIndex(s => s.id === id);
    if (index === -1) return null;

    const updatedSprint = { 
      ...sprints[index], 
      ...updatedData
    };
    
    const updatedSprints = [...sprints];
    updatedSprints[index] = updatedSprint;
    db.sprints = updatedSprints;

    return updatedSprint;
  }

  async delete(id: string): Promise<boolean> {
    const sprints = db.sprints;
    const beforeLength = sprints.length;
    const filtered = sprints.filter(s => s.id !== id);
    db.sprints = filtered;
    return filtered.length < beforeLength;
  }
}

export const sprintRepository = new SprintRepository();
