/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, Mail, Plus, Shield, UserX, UserCheck, CheckCircle2 } from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { UserRole } from "../../types";

export const TeamManagement: React.FC = () => {
  const { 
    currentWorkspace, inviteWorkspaceMember, removeWorkspaceMember, users, currentUser 
  } = useTaskFlow();

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
    <div className="space-y-6">
      
      {/* Dynamic Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-200 rounded-md flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {validationError && (
        <div className="p-4 bg-red-950/20 border border-red-900/30 text-xs text-red-200 rounded-md">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Invite Form (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Plus className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Invite Workspace Member</h3>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white outline-none focus:border-[#333]"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Workspace Role Permission
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white cursor-pointer outline-none focus:border-[#333]"
                >
                  <option value={UserRole.ADMIN}>Admin (Full Control)</option>
                  <option value={UserRole.MANAGER}>Manager (Create & Assign)</option>
                  <option value={UserRole.MEMBER}>Member (Standard Sprint Tasks)</option>
                  <option value={UserRole.GUEST}>Guest (Read & Comment Only)</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-md cursor-pointer"
              >
                Send Workspace Invite
              </button>
            </form>
          </div>

          <div className="bg-[#151515] border border-[#262626] p-4.5 rounded-md text-xs text-zinc-400 space-y-2">
            <span className="font-extrabold text-white block font-mono text-[10px] uppercase tracking-wider">Permission Policy:</span>
            <p>• <span className="font-bold text-zinc-300">Admins</span> have unrestricted access to billing, project archival, and user role updates.</p>
            <p>• <span className="font-bold text-zinc-300">Managers</span> can draft projects, delete issues, and assign team tasks.</p>
            <p>• <span className="font-bold text-zinc-300">Members</span> can execute active task status updates, post comments, and add subtasks.</p>
            <p>• <span className="font-bold text-zinc-300">Guests</span> have observer permissions to review boards, log checklists, and participate in discussion comments.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Members List Grid (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" /> Workspace Directory ({workspaceMembers.length})
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {workspaceMembers.map(member => {
                const memberUser = users.find(u => u.id === member.userId);
                if (!memberUser) return null;

                const isMe = memberUser.id === currentUser?.id;

                return (
                  <div 
                    key={member.userId} 
                    className="p-3.5 bg-[#0b0b0b] border border-[#262626] hover:border-[#333] hover:bg-[#1a1a1a] transition-all rounded-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar with dynamic online presence dot */}
                      <div className="relative shrink-0">
                        <img 
                          src={memberUser.avatar} 
                          alt={memberUser.name} 
                          className="w-10 h-10 rounded-full object-cover border border-[#262626]"
                          referrerPolicy="no-referrer"
                        />
                        {memberUser.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0b0b0b]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">
                          {memberUser.name} {isMe && <span className="text-[9px] text-blue-400 font-mono ml-1.5">(You)</span>}
                        </span>
                        <span className="text-[11px] text-zinc-400 block truncate">{memberUser.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Role Badge */}
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        member.role === UserRole.ADMIN 
                          ? "bg-blue-950/20 text-blue-400 border-blue-900/30" 
                          : member.role === UserRole.MANAGER 
                          ? "bg-purple-950/20 text-purple-400 border-purple-900/30"
                          : member.role === UserRole.MEMBER
                          ? "bg-neutral-850 text-zinc-300 border-neutral-800"
                          : "bg-neutral-900 text-zinc-500 border-neutral-850"
                      }`}>
                        {member.role}
                      </span>

                      {/* Remove Option for managers/admins (disabled for self removal) */}
                      {!isMe && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${memberUser.name} from the workspace?`)) {
                              removeWorkspaceMember(currentWorkspace!.id, member.userId);
                            }
                          }}
                          title="Revoke access"
                          className="p-1 hover:bg-red-950/30 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
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
