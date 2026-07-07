import { db } from "../database/db";
import { Task, Comment, Subtask, ChecklistItem, Attachment } from "../../types";

export class TaskRepository {
  async getAll(): Promise<Task[]> {
    return db.tasks;
  }

  async getById(id: string): Promise<Task | null> {
    return db.tasks.find(t => t.id === id) || null;
  }

  async create(task: Task): Promise<Task> {
    const updated = [task, ...db.tasks];
    db.tasks = updated;
    return task;
  }

  async update(id: string, updatedData: Partial<Task>): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updatedTask = { 
      ...tasks[index], 
      ...updatedData, 
      updatedAt: new Date().toISOString() 
    };
    
    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async delete(id: string): Promise<boolean> {
    const tasks = db.tasks;
    const beforeLength = tasks.length;
    const filtered = tasks.filter(t => t.id !== id);
    db.tasks = filtered;
    return filtered.length < beforeLength;
  }

  async addComment(taskId: string, comment: Comment): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), comment],
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedSubtasks = (task.subtasks || []).map(s => 
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async toggleChecklistItem(taskId: string, itemId: string): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );

    const updatedTask = {
      ...task,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async addSubtask(taskId: string, subtask: Subtask): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedTask = {
      ...task,
      subtasks: [...(task.subtasks || []), subtask],
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async addChecklistItem(taskId: string, item: ChecklistItem): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedTask = {
      ...task,
      checklist: [...(task.checklist || []), item],
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async addAttachment(taskId: string, attachment: Attachment): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedTask = {
      ...task,
      attachments: [...(task.attachments || []), attachment],
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async removeAttachment(taskId: string, attachmentId: string): Promise<Task | null> {
    const tasks = db.tasks;
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedTask = {
      ...task,
      attachments: (task.attachments || []).filter(a => a.id !== attachmentId),
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    db.tasks = updatedTasks;

    return updatedTask;
  }

  async bulkUpdate(taskIds: string[], status: string): Promise<Task[]> {
    const tasks = db.tasks;
    const updatedTasks = tasks.map(t => {
      if (taskIds.includes(t.id)) {
        return {
          ...t,
          status: status as any,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    db.tasks = updatedTasks;
    return updatedTasks.filter(t => taskIds.includes(t.id));
  }
}

export const taskRepository = new TaskRepository();
