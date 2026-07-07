import { taskRepository } from "../repositories/taskRepository";
import { userRepository } from "../repositories/userRepository";
import { automationRuleRepository } from "../repositories/automationRuleRepository";
import { backendEvents } from "../events/eventEmitter";
import { 
  Task, 
  Comment, 
  Subtask, 
  ChecklistItem, 
  Attachment, 
  ActivityAction, 
  TaskStatus, 
  TaskPriority,
  PriorityHistoryItem,
  StatusHistoryItem,
  TimeLog
} from "../../types";

export class TaskService {
  async getTasks(): Promise<Task[]> {
    return await taskRepository.getAll();
  }

  async executeAutomations(task: Task, trigger: "STATUS_CHANGED" | "TASK_CREATED" | "PRIORITY_CHANGED", triggerValue: string) {
    try {
      const activeRules = await automationRuleRepository.getByWorkspace(task.workspaceId);
      const matchingRules = activeRules.filter(r => r.isActive && r.trigger === trigger && r.triggerValue === triggerValue);

      for (const rule of matchingRules) {
        console.log(`Executing automation rule '${rule.name}' for task '${task.title}'`);
        
        if (rule.action === "AUTO_ASSIGN" && rule.actionValue) {
          if (task.assigneeId !== rule.actionValue) {
            task.assigneeId = rule.actionValue;
            await taskRepository.update(task.id, { assigneeId: rule.actionValue });
            backendEvents.logActivity(
              task.id,
              "system",
              ActivityAction.ASSIGNEE_CHANGED,
              `automatically reassigned task via automation rule: "${rule.name}"`
            );
          }
        } else if (rule.action === "SET_PRIORITY" && rule.actionValue) {
          if (task.priority !== rule.actionValue) {
            const newPri = rule.actionValue as TaskPriority;
            const updatedHistory = [...(task.priorityHistory || []), {
              priority: newPri,
              changedBy: "system",
              changedAt: new Date().toISOString()
            }];
            task.priority = newPri;
            task.priorityHistory = updatedHistory;
            await taskRepository.update(task.id, { priority: newPri, priorityHistory: updatedHistory });
            backendEvents.logActivity(
              task.id,
              "system",
              ActivityAction.PRIORITY_CHANGED,
              `automatically updated priority to ${newPri} via automation rule: "${rule.name}"`
            );
          }
        } else if (rule.action === "ADD_COMMENT" && rule.actionValue) {
          await this.addComment(task.id, rule.actionValue, "user-1");
        } else if (rule.action === "SEND_NOTIFICATION" && rule.actionValue) {
          if (task.assigneeId) {
            backendEvents.sendNotification(
              task.assigneeId,
              "Automation Alert",
              `Rule '${rule.name}' action: ${rule.actionValue}`,
              "general"
            );
          }
        }
      }
    } catch (e) {
      console.error("Failed to execute automations:", e);
    }
  }

  async createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "activityTimeline">, creatorId: string): Promise<Task> {
    const taskId = `task-${Date.now()}`;
    const assigneeUser = taskData.assigneeId ? await userRepository.getById(taskData.assigneeId) : null;
    const assigneeName = assigneeUser ? assigneeUser.name : "unassigned";

    const newTask: Task = {
      ...taskData,
      id: taskId,
      comments: [],
      activityTimeline: [
        {
          id: `act-${Date.now()}-created`,
          taskId,
          userId: creatorId,
          action: ActivityAction.CREATED,
          details: `created this task and assigned it to ${assigneeName}`,
          createdAt: new Date().toISOString()
        }
      ],
      watchers: taskData.watchers || [],
      dependencies: taskData.dependencies || [],
      priorityHistory: [
        {
          priority: taskData.priority,
          changedBy: creatorId,
          changedAt: new Date().toISOString()
        }
      ],
      statusHistory: [
        {
          status: taskData.status,
          changedBy: creatorId,
          changedAt: new Date().toISOString()
        }
      ],
      timeTracking: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const task = await taskRepository.create(newTask);

    // Notify assignee
    if (taskData.assigneeId && taskData.assigneeId !== creatorId) {
      const creator = await userRepository.getById(creatorId);
      backendEvents.sendNotification(
        taskData.assigneeId,
        "New Task Assigned",
        `${creator ? creator.name : "A teammate"} assigned task '${task.title}' to you.`,
        "assignment"
      );
    }

    // Trigger TASK_CREATED automation
    await this.executeAutomations(task, "TASK_CREATED", "");

    return task;
  }

  async updateTask(id: string, updatedData: Partial<Task>, modifierId: string): Promise<Task | null> {
    const original = await taskRepository.getById(id);
    if (!original) return null;

    const modifier = await userRepository.getById(modifierId);
    const modifierName = modifier ? modifier.name : "A teammate";

    const priorityHistory = original.priorityHistory || [];
    const statusHistory = original.statusHistory || [];

    // Detect status change
    if (updatedData.status && updatedData.status !== original.status) {
      statusHistory.push({
        status: updatedData.status,
        changedBy: modifierId,
        changedAt: new Date().toISOString()
      });
      updatedData.statusHistory = statusHistory;

      backendEvents.logActivity(
        id,
        modifierId,
        ActivityAction.STATUS_CHANGED,
        `moved task from ${original.status} to ${updatedData.status}`
      );

      // Notify reporter/assignee
      const notifyUsers = [original.reporterId, original.assigneeId].filter(
        uid => uid && uid !== modifierId
      ) as string[];

      for (const uid of notifyUsers) {
        backendEvents.sendNotification(
          uid,
          "Task Status Updated",
          `${modifierName} updated task '${original.title}' to ${updatedData.status}`,
          "status"
        );
      }
    }

    // Detect priority change
    if (updatedData.priority && updatedData.priority !== original.priority) {
      priorityHistory.push({
        priority: updatedData.priority,
        changedBy: modifierId,
        changedAt: new Date().toISOString()
      });
      updatedData.priorityHistory = priorityHistory;

      backendEvents.logActivity(
        id,
        modifierId,
        ActivityAction.PRIORITY_CHANGED,
        `changed priority from ${original.priority} to ${updatedData.priority}`
      );
    }

    // Detect assignee change
    if (updatedData.assigneeId && updatedData.assigneeId !== original.assigneeId) {
      const newAssignee = updatedData.assigneeId ? await userRepository.getById(updatedData.assigneeId) : null;
      backendEvents.logActivity(
        id,
        modifierId,
        ActivityAction.ASSIGNEE_CHANGED,
        `reassigned task to ${newAssignee ? newAssignee.name : "unassigned"}`
      );

      if (updatedData.assigneeId && updatedData.assigneeId !== modifierId) {
        backendEvents.sendNotification(
          updatedData.assigneeId,
          "Task Assigned to You",
          `${modifierName} assigned task '${original.title}' to you.`,
          "assignment"
        );
      }
    }

    const updatedTask = await taskRepository.update(id, updatedData);
    if (updatedTask) {
      // Trigger STATUS_CHANGED automations if applicable
      if (updatedData.status && updatedData.status !== original.status) {
        await this.executeAutomations(updatedTask, "STATUS_CHANGED", updatedData.status);
      }
      // Trigger PRIORITY_CHANGED automations if applicable
      if (updatedData.priority && updatedData.priority !== original.priority) {
        await this.executeAutomations(updatedTask, "PRIORITY_CHANGED", updatedData.priority);
      }
    }

    return updatedTask;
  }

  // Time logging operations
  async logTime(taskId: string, userId: string, durationMinutes: number, description?: string): Promise<Task | null> {
    const task = await taskRepository.getById(taskId);
    if (!task) return null;

    const timeTracking = task.timeTracking || [];
    const log: TimeLog = {
      id: `time-${Date.now()}`,
      userId,
      durationMinutes,
      description,
      loggedAt: new Date().toISOString()
    };
    const updatedLogs = [...timeTracking, log];

    const totalMinutes = updatedLogs.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    const actualHours = parseFloat((totalMinutes / 60).toFixed(2));

    backendEvents.logActivity(
      taskId,
      userId,
      ActivityAction.DETAILS_UPDATED,
      `logged ${durationMinutes} minutes: "${description || 'no details'}"`
    );

    return await taskRepository.update(taskId, {
      timeTracking: updatedLogs,
      actualHours
    });
  }

  // Watchers operations
  async addWatcher(taskId: string, userId: string): Promise<Task | null> {
    const task = await taskRepository.getById(taskId);
    if (!task) return null;
    const watchers = task.watchers || [];
    if (watchers.includes(userId)) return task;
    return await taskRepository.update(taskId, { watchers: [...watchers, userId] });
  }

  async removeWatcher(taskId: string, userId: string): Promise<Task | null> {
    const task = await taskRepository.getById(taskId);
    if (!task) return null;
    const watchers = task.watchers || [];
    return await taskRepository.update(taskId, { watchers: watchers.filter(id => id !== userId) });
  }

  // Dependencies operations
  async addDependency(taskId: string, dependsOnTaskId: string): Promise<Task | null> {
    const task = await taskRepository.getById(taskId);
    if (!task) return null;
    const dependencies = task.dependencies || [];
    if (dependencies.includes(dependsOnTaskId)) return task;
    return await taskRepository.update(taskId, { dependencies: [...dependencies, dependsOnTaskId] });
  }

  async removeDependency(taskId: string, dependsOnTaskId: string): Promise<Task | null> {
    const task = await taskRepository.getById(taskId);
    if (!task) return null;
    const dependencies = task.dependencies || [];
    return await taskRepository.update(taskId, { dependencies: dependencies.filter(id => id !== dependsOnTaskId) });
  }

  // Sprint support operations
  async linkSprint(taskId: string, sprintId: string | null): Promise<Task | null> {
    return await taskRepository.update(taskId, { sprintId: sprintId || undefined });
  }

  async deleteTask(id: string): Promise<boolean> {
    return await taskRepository.delete(id);
  }

  async duplicateTask(id: string, creatorId: string): Promise<Task | null> {
    const original = await taskRepository.getById(id);
    if (!original) return null;

    const dup: Task = {
      ...original,
      id: `task-${Date.now()}`,
      title: `${original.title} (Copy)`,
      comments: [],
      activityTimeline: [
        {
          id: `act-${Date.now()}-dup`,
          taskId: `task-${Date.now()}`,
          userId: creatorId,
          action: ActivityAction.CREATED,
          details: `created task duplicate of ${original.title}`,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await taskRepository.create(dup);
  }

  async addComment(taskId: string, content: string, userId: string): Promise<Task | null> {
    const commenter = await userRepository.getById(userId);
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      taskId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };

    const task = await taskRepository.addComment(taskId, newComment);
    if (task) {
      backendEvents.logActivity(
        taskId,
        userId,
        ActivityAction.COMMENT_ADDED,
        `added a comment: "${content.substring(0, 40)}${content.length > 40 ? "..." : ""}"`
      );

      // Notify assignee if not commenter
      if (task.assigneeId && task.assigneeId !== userId) {
        backendEvents.sendNotification(
          task.assigneeId,
          "New Comment",
          `${commenter ? commenter.name : "A teammate"} commented on '${task.title}'`,
          "mention"
        );
      }
    }

    return task;
  }

  async toggleSubtask(taskId: string, subtaskId: string, userId: string): Promise<Task | null> {
    const task = await taskRepository.toggleSubtask(taskId, subtaskId);
    if (task) {
      const sub = task.subtasks.find(s => s.id === subtaskId);
      backendEvents.logActivity(
        taskId,
        userId,
        ActivityAction.SUBTASK_UPDATED,
        `${sub?.isCompleted ? "completed" : "uncompleted"} subtask: "${sub?.title}"`
      );
    }
    return task;
  }

  async toggleChecklistItem(taskId: string, itemId: string, userId: string): Promise<Task | null> {
    const task = await taskRepository.toggleChecklistItem(taskId, itemId);
    if (task) {
      const item = task.checklist.find(i => i.id === itemId);
      backendEvents.logActivity(
        taskId,
        userId,
        ActivityAction.CHECKLIST_UPDATED,
        `${item?.isCompleted ? "completed" : "uncompleted"} checklist item: "${item?.title}"`
      );
    }
    return task;
  }

  async addSubtask(taskId: string, title: string): Promise<Task | null> {
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      isCompleted: false
    };
    return await taskRepository.addSubtask(taskId, newSub);
  }

  async addChecklistItem(taskId: string, title: string): Promise<Task | null> {
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title,
      isCompleted: false
    };
    return await taskRepository.addChecklistItem(taskId, newItem);
  }

  async addAttachment(taskId: string, name: string, size: string, url: string): Promise<Task | null> {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name,
      size,
      url,
      uploadedAt: new Date().toISOString()
    };
    return await taskRepository.addAttachment(taskId, newAtt);
  }

  async removeAttachment(taskId: string, attachmentId: string): Promise<Task | null> {
    return await taskRepository.removeAttachment(taskId, attachmentId);
  }

  async bulkUpdate(taskIds: string[], status: TaskStatus): Promise<Task[]> {
    return await taskRepository.bulkUpdate(taskIds, status);
  }
}

export const taskService = new TaskService();
