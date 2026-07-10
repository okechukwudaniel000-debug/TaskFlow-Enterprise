/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";

interface BreadcrumbsProps {
  activeView: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeView }) => {
  const { currentWorkspace } = useTaskFlow();

  const path = [
    { label: "Sector", id: "sector" },
    { label: currentWorkspace?.name || "Global", id: "workspace" },
    { label: activeView.toUpperCase() + " VIEW", id: "view" },
  ];

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400">
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          <span className={`${index === path.length - 1 ? "text-emerald-400" : "text-white"}`}>
            {item.label}
          </span>
          {index < path.length - 1 && (
            <ChevronRight className="w-3 h-3 text-zinc-600" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
