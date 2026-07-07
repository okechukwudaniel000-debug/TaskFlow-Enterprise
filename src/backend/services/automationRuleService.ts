import { automationRuleRepository } from "../repositories/automationRuleRepository";
import { AutomationRule } from "../../types";

export class AutomationRuleService {
  async getRules(): Promise<AutomationRule[]> {
    return await automationRuleRepository.getAll();
  }

  async getRulesByWorkspace(workspaceId: string): Promise<AutomationRule[]> {
    return await automationRuleRepository.getByWorkspace(workspaceId);
  }

  async getRuleById(id: string): Promise<AutomationRule | null> {
    return await automationRuleRepository.getById(id);
  }

  async createRule(
    workspaceId: string, 
    name: string, 
    trigger: "STATUS_CHANGED" | "TASK_CREATED" | "PRIORITY_CHANGED", 
    triggerValue: string | undefined, 
    action: "AUTO_ASSIGN" | "SET_PRIORITY" | "ADD_COMMENT" | "SEND_NOTIFICATION", 
    actionValue: string | undefined
  ): Promise<AutomationRule> {
    const id = `auto-${Date.now()}`;
    const newRule: AutomationRule = {
      id,
      workspaceId,
      name,
      trigger,
      triggerValue,
      action,
      actionValue,
      isActive: true
    };
    return await automationRuleRepository.create(newRule);
  }

  async updateRule(id: string, updatedData: Partial<AutomationRule>): Promise<AutomationRule | null> {
    return await automationRuleRepository.update(id, updatedData);
  }

  async deleteRule(id: string): Promise<boolean> {
    return await automationRuleRepository.delete(id);
  }
}

export const automationRuleService = new AutomationRuleService();
