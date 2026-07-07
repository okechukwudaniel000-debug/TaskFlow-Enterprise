import { db } from "../database/db";
import { Project } from "../../types";

export class ProjectRepository {
  async getAll(): Promise<Project[]> {
    return db.projects;
  }

  async getById(id: string): Promise<Project | null> {
    return db.projects.find(p => p.id === id) || null;
  }

  async create(project: Project): Promise<Project> {
    const updated = [...db.projects, project];
    db.projects = updated;
    return project;
  }

  async update(id: string, updatedData: Partial<Project>): Promise<Project | null> {
    const projects = db.projects;
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject = { ...projects[index], ...updatedData };
    const updatedProjects = [...projects];
    updatedProjects[index] = updatedProject;
    db.projects = updatedProjects;

    return updatedProject;
  }

  async toggleFavorite(id: string): Promise<Project | null> {
    const projects = db.projects;
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject = { ...projects[index], isFavorite: !projects[index].isFavorite };
    const updatedProjects = [...projects];
    updatedProjects[index] = updatedProject;
    db.projects = updatedProjects;

    return updatedProject;
  }

  async archive(id: string): Promise<Project | null> {
    return this.update(id, { isArchived: true });
  }
}

export const projectRepository = new ProjectRepository();
