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
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export const ProjectCatalog: React.FC = () => {
  const { 
    projects, createProject, editProject, archiveProject, 
    duplicateProject, toggleFavoriteProject 
  } = useTaskFlow();

  const { colors } = useMilitaryTheme();

  // Search filter
  const [projQuery, setProjQuery] = useState("");

  // Create Project Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjColor, setNewProjColor] = useState("#22C55E"); // default success green
  const [newProjIcon, setNewProjIcon] = useState("Rocket");
  const [newProjTemplate, setNewProjTemplate] = useState("software");

  const [validationError, setValidationError] = useState<string | null>(null);

  // Available brand coloring circles matching military tones
  const BRAND_COLORS = [
    { value: "#22C55E", label: "Tactical Emerald" },
    { value: "#84CC16", label: "Acid Lime" },
    { value: "#EAB308", label: "Warning Amber" },
    { value: "#EF4444", label: "Hostile Red" },
    { value: "#3B82F6", label: "Secure Cyan" },
    { value: "#EC4899", label: "Radar Purple" },
  ];

  // Templates
  const TEMPLATES = [
    { value: "software", label: "Agile Software Recon Planning" },
    { value: "kanban", label: "Continuous Combat Kanban Flow" },
    { value: "marketing", label: "Strategic Broadcast Launch" },
  ];

  // Icons
  const ICONS = ["Rocket", "Megaphone", "ShieldAlert", "BadgeCheck", "Layers"];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!newProjName.trim()) {
      setValidationError("Sector mission name is required.");
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
    setNewProjColor("#22C55E");
    setNewProjIcon("Rocket");
    setNewProjTemplate("software");
    setShowCreateForm(false);
  };

  const filteredProjects = projects.filter(p => 
    !p.isArchived && 
    p.name.toLowerCase().includes(projQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono relative z-10">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={projQuery}
            onChange={(e) => setProjQuery(e.target.value)}
            placeholder="FILTER SECTOR DIVISION DEPLOYMENTS..."
            className={`w-full bg-black/40 border ${colors.border} rounded-sm pl-9 pr-4 py-2 text-[10px] font-bold text-white placeholder-neutral-600 outline-none focus:border-neutral-500 uppercase`}
          />
        </div>

        {/* Create Project Toggler */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`px-4 py-2 rounded-sm bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white text-[10px] tracking-widest font-extrabold uppercase flex items-center gap-2 cursor-pointer self-start md:self-auto transition-colors active:scale-95`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showCreateForm ? "ABORT DEPLOY" : "DEPLOY NEW SECTOR"}</span>
        </button>

      </div>

      {/* Slide-in Create project Form when active */}
      {showCreateForm && (
        <div className={`bg-black/35 border ${colors.border} rounded-sm p-6 shadow-sm space-y-4 max-w-xl`}>
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest font-mono">[HQ SECURE] INITIALIZE MISSION SECTOR</h3>
          </div>

          {validationError && (
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-sm text-[9px] text-red-300 uppercase font-mono">
              [ALERT]: {validationError}
            </div>
          )}

          <form onSubmit={handleCreateProject} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">SECTOR MISSION NAME</label>
              <input
                type="text"
                placeholder="e.g. MISSION CODENAME ZEPHYR"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white outline-none focus:border-neutral-500 uppercase`}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">OPERATIONAL BRIEFING</label>
              <textarea
                placeholder="Brief description of sector milestones or tactical goals..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                rows={3}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white outline-none resize-y focus:border-neutral-500`}
              />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Template */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">OPERATIONAL BLUEPRINT</label>
                <select
                  value={newProjTemplate}
                  onChange={(e) => setNewProjTemplate(e.target.value)}
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white cursor-pointer outline-none focus:border-neutral-500 uppercase`}
                >
                  {TEMPLATES.map(t => (
                    <option key={t.value} value={t.value} className="bg-neutral-900 text-white">{t.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Icon Choice */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">LAUNCH TELEMETRY ICON</label>
                <select
                  value={newProjIcon}
                  onChange={(e) => setNewProjIcon(e.target.value)}
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white cursor-pointer outline-none focus:border-neutral-500 uppercase`}
                >
                  {ICONS.map(ic => (
                    <option key={ic} value={ic} className="bg-neutral-900 text-white">{ic.toUpperCase()}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Brand Colors Selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">TACTICAL HUELIGHT SIGNATURE</label>
              <div className="flex gap-2.5 pt-1">
                {BRAND_COLORS.map(c => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setNewProjColor(c.value)}
                    title={c.label}
                    className={`w-5.5 h-5.5 rounded-sm cursor-pointer border-2 transition-all ${
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
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                ABORT
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-sm cursor-pointer transition-colors active:scale-95"
              >
                CONFIRM DEPLOY
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 border border-dashed border-white/[0.04] rounded-sm col-span-full">
            <p className="text-[10px] uppercase tracking-widest">[EMPTY SECTOR] No active deployment sectors located. Initialize one above!</p>
          </div>
        ) : (
          filteredProjects.map(proj => {
            return (
              <div 
                key={proj.id} 
                className={`bg-black/35 border ${colors.border} rounded-sm p-5 hover:border-neutral-500 transition-all flex flex-col justify-between h-[210px]`}
              >
                {/* Header row */}
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div className="p-2 bg-black/40 rounded-sm border shrink-0 text-white" style={{ borderColor: `${proj.color}35` }}>
                        {proj.icon === "Rocket" && <Rocket className="w-4 h-4 text-emerald-400" />}
                        {proj.icon === "Megaphone" && <Megaphone className="w-4 h-4 text-amber-500" />}
                        {proj.icon === "ShieldAlert" && <ShieldAlert className="w-4 h-4 text-red-500" />}
                        {proj.icon === "BadgeCheck" && <BadgeCheck className="w-4 h-4 text-sky-400" />}
                        {proj.icon === "Layers" && <Layers className="w-4 h-4 text-purple-400" />}
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white uppercase truncate block tracking-wide">{proj.name}</span>
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono mt-0.5 tracking-wider font-extrabold">{proj.template} RECON PROTOCOL</span>
                      </div>
                    </div>

                    {/* Star Pin favorite */}
                    <button
                      onClick={() => toggleFavoriteProject(proj.id)}
                      className={`p-1 rounded-sm hover:bg-white/[0.02] cursor-pointer transition-colors ${
                        proj.isFavorite ? "text-amber-400" : "text-zinc-600"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-3.5 leading-relaxed line-clamp-3 uppercase tracking-wide">
                    {proj.description || "No project operational parameters logged."}
                  </p>
                </div>

                {/* Footer Controls Row */}
                <div className={`pt-4 border-t ${colors.borderMuted} flex items-center justify-between`}>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="w-full bg-neutral-900 border border-white/[0.04] h-1.5 rounded-sm overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-sm" style={{ width: `${proj.progress}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 font-mono shrink-0">{proj.progress}%</span>
                  </div>

                  {/* Actions (Duplicate, Archive) */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => duplicateProject(proj.id)}
                      title="Duplicate Project"
                      className="p-1 hover:bg-white/[0.02] rounded-sm text-zinc-500 hover:text-white cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to archive sector deployment "${proj.name}"?`)) {
                          archiveProject(proj.id);
                        }
                      }}
                      title="Archive Project"
                      className="p-1 hover:bg-red-950/20 rounded-sm text-zinc-500 hover:text-red-400 cursor-pointer transition-colors"
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
