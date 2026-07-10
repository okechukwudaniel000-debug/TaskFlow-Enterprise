/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Zap, Plus, Settings, BarChart3 } from "lucide-react";
import { Dropdown, Button } from "../ui";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { TaskStatus } from "../../types";

interface QuickActionsProps {
  onTriggerCreateTask: (status: TaskStatus) => void;
  onNavigate: (view: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onTriggerCreateTask, onNavigate }) => {
  const actions = [
    { label: "New Task", value: "task", icon: <Plus className="w-3.5 h-3.5" /> },
    { label: "Settings", value: "settings", icon: <Settings className="w-3.5 h-3.5" /> },
    { label: "Analytics", value: "analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <Dropdown
      items={actions}
      onSelect={(val) => {
        if (val === "task") onTriggerCreateTask(TaskStatus.TODO);
        else onNavigate(val);
      }}
      selectedValue=""
      buttonContent={
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>QUICK ACTIONS</span>
        </Button>
      }
    />
  );
};
