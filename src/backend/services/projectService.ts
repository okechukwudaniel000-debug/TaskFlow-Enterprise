import { projectRepository } from "../repositories/projectRepository";
import { taskRepository } from "../repositories/taskRepository";
import { Project, Task } from "../../types";

export class ProjectService {
  async getProjects(): Promise<Project[]> {
    return await projectRepository.getAll();
  }

  async createProject(name: string, description: string, color: string, icon: string, template: string, workspaceId: string, ownerId: string = "user-1"): Promise<Project> {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      workspaceId,
      color,
      icon,
      isArchived: false,
      isFavorite: false,
      template,
      progress: 0,
      createdAt: new Date().toISOString(),
      ownerId
    };
    return await projectRepository.create(newProj);
  }

  async updateProject(id: string, updatedData: Partial<Project>): Promise<Project | null> {
    return await projectRepository.update(id, updatedData);
  }

  async toggleFavorite(id: string): Promise<Project | null> {
    return await projectRepository.toggleFavorite(id);
  }

  async archiveProject(id: string): Promise<Project | null> {
    return await projectRepository.archive(id);
  }

  async duplicateProject(id: string): Promise<Project | null> {
    const source = await projectRepository.getById(id);
    if (!source) return null;

    const duplicateProj = await this.createProject(
      `${source.name} (Copy)`,
      source.description || "",
      source.color,
      source.icon,
      source.template,
      source.workspaceId,
      source.ownerId
    );

    // Duplicate all associated tasks as well
    const allTasks = await taskRepository.getAll();
    const sourceTasks = allTasks.filter(t => t.projectId === id);

    for (const task of sourceTasks) {
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: duplicateProj.id,
        comments: [],
        activityTimeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await taskRepository.create(newTask);
    }

    return duplicateProj;
  }
}

export const projectService = new ProjectService();
