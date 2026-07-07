import { db } from "../database/db";
import { AutomationRule } from "../../types";

export class AutomationRuleRepository {
  async getAll(): Promise<AutomationRule[]> {
    return db.automationRules;
  }

  async getById(id: string): Promise<AutomationRule | null> {
    return db.automationRules.find(a => a.id === id) || null;
  }

  async getByWorkspace(workspaceId: string): Promise<AutomationRule[]> {
    return db.automationRules.filter(a => a.workspaceId === workspaceId);
  }

  async create(rule: AutomationRule): Promise<AutomationRule> {
    const updated = [...db.automationRules, rule];
    db.automationRules = updated;
    return rule;
  }

  async update(id: string, updatedData: Partial<AutomationRule>): Promise<AutomationRule | null> {
    const rules = db.automationRules;
    const index = rules.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updatedRule = { 
      ...rules[index], 
      ...updatedData
    };
    
    const updatedRules = [...rules];
    updatedRules[index] = updatedRule;
    db.automationRules = updatedRules;

    return updatedRule;
  }

  async delete(id: string): Promise<boolean> {
    const rules = db.automationRules;
    const beforeLength = rules.length;
    const filtered = rules.filter(a => a.id !== id);
    db.automationRules = filtered;
    return filtered.length < beforeLength;
  }
}

export const automationRuleRepository = new AutomationRuleRepository();
