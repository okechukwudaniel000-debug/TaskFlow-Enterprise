import { sprintRepository } from "../repositories/sprintRepository";
import { taskRepository } from "../repositories/taskRepository";
import { Sprint } from "../../types";

export class SprintService {
  async getSprints(): Promise<Sprint[]> {
    return await sprintRepository.getAll();
  }

  async getSprintsByWorkspace(workspaceId: string): Promise<Sprint[]> {
    return await sprintRepository.getByWorkspace(workspaceId);
  }

  async getSprintById(id: string): Promise<Sprint | null> {
    return await sprintRepository.getById(id);
  }

  async createSprint(workspaceId: string, name: string, startDate: string, endDate: string): Promise<Sprint> {
    const id = `spr-${Date.now()}`;
    const newSprint: Sprint = {
      id,
      workspaceId,
      name,
      startDate,
      endDate,
      status: "planned"
    };
    return await sprintRepository.create(newSprint);
  }

  async updateSprint(id: string, updatedData: Partial<Sprint>): Promise<Sprint | null> {
    return await sprintRepository.update(id, updatedData);
  }

  async startSprint(id: string): Promise<Sprint | null> {
    // Check if there is already an active sprint in the same workspace
    const sprint = await sprintRepository.getById(id);
    if (!sprint) return null;

    const allSprints = await sprintRepository.getByWorkspace(sprint.workspaceId);
    const activeSprint = allSprints.find(s => s.status === "active");
    if (activeSprint) {
      // Complete or pause the other active sprint
      await sprintRepository.update(activeSprint.id, { status: "completed" });
    }

    return await sprintRepository.update(id, { status: "active" });
  }

  async completeSprint(id: string): Promise<Sprint | null> {
    return await sprintRepository.update(id, { status: "completed" });
  }

  async deleteSprint(id: string): Promise<boolean> {
    // If deleted, also clear task reference
    const ok = await sprintRepository.delete(id);
    if (ok) {
      const tasks = await taskRepository.getAll();
      const linkedTasks = tasks.filter(t => t.sprintId === id);
      for (const t of linkedTasks) {
        await taskRepository.update(t.id, { sprintId: undefined });
      }
    }
    return ok;
  }
}

export const sprintService = new SprintService();
