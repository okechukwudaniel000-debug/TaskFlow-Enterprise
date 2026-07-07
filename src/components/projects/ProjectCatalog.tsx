/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Star, Archive, Copy, Search, Layers, Sparkles, 
  Settings, CheckCircle, Rocket, Megaphone, ShieldAlert, BadgeCheck
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { Project } from "../../types";

export const ProjectCatalog: React.FC = () => {
  const { 
    projects, createProject, editProject, archiveProject, 
    duplicateProject, toggleFavoriteProject 
  } = useTaskFlow();

  // Search filter
  const [projQuery, setProjQuery] = useState("");

  // Create Project Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjColor, setNewProjColor] = useState("#2563EB");
  const [newProjIcon, setNewProjIcon] = useState("Rocket");
  const [newProjTemplate, setNewProjTemplate] = useState("software");

  const [validationError, setValidationError] = useState<string | null>(null);

  // Available brand coloring circles
  const BRAND_COLORS = [
    { value: "#2563EB", label: "Enterprise Blue" },
    { value: "#22C55E", label: "Success Green" },
    { value: "#F59E0B", label: "Warning Amber" },
    { value: "#EF4444", label: "Danger Coral" },
    { value: "#A855F7", label: "Creative Amethyst" },
    { value: "#06B6D4", label: "Info Cyan" },
  ];

  // Templates
  const TEMPLATES = [
    { value: "software", label: "Software Sprint Planning" },
    { value: "kanban", label: "Continuous Kanban Flow" },
    { value: "marketing", label: "Marketing Outreach Launch" },
  ];

  // Icons
  const ICONS = ["Rocket", "Megaphone", "ShieldAlert", "BadgeCheck", "Layers"];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!newProjName.trim()) {
      setValidationError("Project title is required.");
      return;
    }

    createProject(
      newProjName.trim(),
      newProjDesc.trim(),
      newProjColor,
      newProjIcon,
      newProjTemplate
    );

    // Reset Form
    setNewProjName("");
    setNewProjDesc("");
    setNewProjColor("#2563EB");
    setNewProjIcon("Rocket");
    setNewProjTemplate("software");
    setShowCreateForm(false);
  };

  const filteredProjects = projects.filter(p => 
    !p.isArchived && 
    p.name.toLowerCase().includes(projQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={projQuery}
            onChange={(e) => setProjQuery(e.target.value)}
            placeholder="Search workspace projects..."
            className="w-full bg-[#151515] border border-[#262626] rounded-md pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-[#333] outline-none"
          />
        </div>

        {/* Create Project Toggler */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreateForm ? "Close Form" : "Create Project"}</span>
        </button>

      </div>

      {/* Slide-in Create project Form when active */}
      {showCreateForm && (
        <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4 max-w-xl">
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Initialize New Project</h3>
          </div>

          {validationError && (
            <p className="text-xs text-red-400 font-semibold">{validationError}</p>
          )}

          <form onSubmit={handleCreateProject} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Project Name</label>
              <input
                type="text"
                placeholder="e.g. Apollo Infrastructure API"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white outline-none focus:border-[#333]"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Description</label>
              <textarea
                placeholder="Brief description of project milestones..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                rows={3}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white outline-none focus:border-[#333]"
              />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Template */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Agile Template</label>
                <select
                  value={newProjTemplate}
                  onChange={(e) => setNewProjTemplate(e.target.value)}
                  className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white cursor-pointer outline-none focus:border-[#333]"
                >
                  {TEMPLATES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Icon Choice */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">System Icon</label>
                <select
                  value={newProjIcon}
                  onChange={(e) => setNewProjIcon(e.target.value)}
                  className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white cursor-pointer outline-none focus:border-[#333]"
                >
                  {ICONS.map(ic => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Brand Colors Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Visual Brand Hue</label>
              <div className="flex gap-2.5 pt-1">
                {BRAND_COLORS.map(c => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setNewProjColor(c.value)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all ${
                      newProjColor === c.value ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 border border-dashed border-[#262626] rounded-md col-span-full">
            <p className="text-xs">No active projects found. Initialize one above!</p>
          </div>
        ) : (
          filteredProjects.map(proj => {
            return (
              <div 
                key={proj.id} 
                className="bg-[#151515] border border-[#262626] rounded-md p-5 hover:border-[#333] transition-all flex flex-col justify-between h-[200px]"
              >
                {/* Header row */}
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div className="p-2.5 rounded-md border border-[#262626] shrink-0 text-white bg-[#0b0b0b]" style={{ borderColor: `${proj.color}25` }}>
                        {proj.icon === "Rocket" && <Rocket className="w-4 h-4 text-blue-400" />}
                        {proj.icon === "Megaphone" && <Megaphone className="w-4 h-4 text-amber-500" />}
                        {proj.icon === "ShieldAlert" && <ShieldAlert className="w-4 h-4 text-red-500" />}
                        {proj.icon === "BadgeCheck" && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                        {proj.icon === "Layers" && <Layers className="w-4 h-4 text-cyan-400" />}
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white truncate block">{proj.name}</span>
                        <span className="text-[9px] text-zinc-500 block uppercase font-mono mt-0.5 tracking-wider">{proj.template} template</span>
                      </div>
                    </div>

                    {/* Star Pin favorite */}
                    <button
                      onClick={() => toggleFavoriteProject(proj.id)}
                      className={`p-1 rounded hover:bg-[#1a1a1a] cursor-pointer ${
                        proj.isFavorite ? "text-amber-400" : "text-zinc-500"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 mt-3.5 leading-relaxed line-clamp-3">
                    {proj.description || "No project overview details logged."}
                  </p>
                </div>

                {/* Footer Controls Row */}
                <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="w-full bg-[#0b0b0b] border border-[#262626] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${proj.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-white font-mono shrink-0">{proj.progress}%</span>
                  </div>

                  {/* Actions (Duplicate, Archive) */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => duplicateProject(proj.id)}
                      title="Duplicate Project (with duplicate issues)"
                      className="p-1 hover:bg-[#1a1a1a] rounded text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to archive "${proj.name}"?`)) {
                          archiveProject(proj.id);
                        }
                      }}
                      title="Archive Project"
                      className="p-1 hover:bg-red-950/20 rounded text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
