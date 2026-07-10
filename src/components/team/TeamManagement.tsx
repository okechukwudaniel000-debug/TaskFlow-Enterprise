/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, Mail, Plus, Shield, UserX } from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { UserRole } from "../../types";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export const TeamManagement: React.FC = () => {
  const { 
    currentWorkspace, inviteWorkspaceMember, removeWorkspaceMember, users, currentUser 
  } = useTaskFlow();

  const { colors } = useMilitaryTheme();

  // Invite Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.MEMBER);
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter users that belong to this workspace
  const workspaceMembers = currentWorkspace?.members || [];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMsg(null);

    if (!inviteEmail.trim()) {
      setValidationError("Email address is required.");
      return;
    }

    if (!currentWorkspace) return;

    inviteWorkspaceMember(currentWorkspace.id, inviteEmail.trim().toLowerCase(), inviteRole);
    setSuccessMsg(`Invitation dispatched. Registered "${inviteEmail}" as a ${inviteRole} inside the workspace.`);
    setInviteEmail("");
  };

  return (
    <div className="space-y-6 font-mono relative z-10">
      
      {/* Dynamic Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 text-[10px] text-emerald-200 rounded-sm flex items-center gap-2.5 uppercase font-bold tracking-wider">
          <span className="text-emerald-400">[DISPATCH_OK]:</span>
          <span>{successMsg}</span>
        </div>
      )}

      {validationError && (
        <div className="p-4 bg-red-950/20 border border-red-800/40 text-[10px] text-red-200 rounded-sm uppercase font-bold tracking-wider">
          <span className="text-red-400">[DISPATCH_FAIL]:</span>
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Invite Form (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
            <div className="flex items-center gap-2 text-emerald-400">
              <Plus className="w-4 h-4" />
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest font-mono">[HQ SECURE] RECRUIT SECTOR OPERATOR</h3>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> SECURE EMAIL CONTACT
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white outline-none focus:border-neutral-500 uppercase`}
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-500" /> SECURITY ROLE PERMISSION
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white cursor-pointer outline-none focus:border-neutral-500 uppercase`}
                >
                  <option value={UserRole.ADMIN} className="bg-neutral-900 text-white">ADMIN (FULL COMMAND CONTROL)</option>
                  <option value={UserRole.MANAGER} className="bg-neutral-900 text-white">MANAGER (CREATE & DISPATCH)</option>
                  <option value={UserRole.MEMBER} className="bg-neutral-900 text-white">MEMBER (STANDARD OPERATIONAL ASSIGNMENTS)</option>
                  <option value={UserRole.GUEST} className="bg-neutral-900 text-white">GUEST (READ & COMMENT OBSERVER)</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-sm cursor-pointer transition-colors active:scale-95 shadow shadow-black"
              >
                DISPATCH SECURITY INVITE
              </button>
            </form>
          </div>

          <div className={`bg-black/35 border ${colors.borderMuted} p-5 rounded-sm text-[9px] text-zinc-400 space-y-2 uppercase`}>
            <span className="font-extrabold text-white block font-mono text-[10px] tracking-widest">TACTICAL PERMISSION POLICY:</span>
            <p>• <span className="font-extrabold text-zinc-200">Admins</span> have unrestricted access to billing, project archival, and workspace permission controls.</p>
            <p>• <span className="font-extrabold text-zinc-200">Managers</span> can draft project sectors, delete tasks, and assign team operators.</p>
            <p>• <span className="font-extrabold text-zinc-200">Members</span> can execute active task updates, log comments, and add subtasks.</p>
            <p>• <span className="font-extrabold text-zinc-200">Guests</span> have observer access to review dashboards, check logs, and post discussion updates.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Members List Grid (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-extrabold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" /> ACTIVE WORKSPACE DIRECTORY ({workspaceMembers.length})
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
              {workspaceMembers.map(member => {
                const memberUser = users.find(u => u.id === member.userId);
                if (!memberUser) return null;

                const isMe = memberUser.id === currentUser?.id;

                return (
                  <div 
                    key={member.userId} 
                    className={`p-3.5 bg-black/40 border ${colors.border} hover:border-neutral-500 transition-all rounded-sm flex items-center justify-between gap-4`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar with dynamic online presence dot */}
                      <div className="relative shrink-0">
                        <img 
                          src={memberUser.avatar} 
                          alt={memberUser.name} 
                          className="w-10 h-10 rounded-full object-cover border border-white/[0.04]"
                          referrerPolicy="no-referrer"
                        />
                        {memberUser.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-neutral-900" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate uppercase tracking-wide">
                          {memberUser.name} {isMe && <span className="text-[8px] text-emerald-400 font-mono ml-1.5 font-extrabold">[YOU]</span>}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate font-mono">{memberUser.email.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Role Badge */}
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                        member.role === UserRole.ADMIN 
                          ? "bg-sky-950/40 text-sky-400 border-sky-800/40" 
                          : member.role === UserRole.MANAGER 
                          ? "bg-purple-950/40 text-purple-400 border-purple-800/40"
                          : member.role === UserRole.MEMBER
                          ? "bg-neutral-900 text-zinc-300 border-neutral-800"
                          : "bg-neutral-950 text-zinc-500 border-neutral-900"
                      }`}>
                        {member.role}
                      </span>

                      {/* Remove Option for managers/admins (disabled for self removal) */}
                      {!isMe && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove operator "${memberUser.name}" from this command workspace?`)) {
                              removeWorkspaceMember(currentWorkspace!.id, member.userId);
                            }
                          }}
                          title="Revoke access"
                          className="p-1 hover:bg-red-950/20 rounded-sm text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
