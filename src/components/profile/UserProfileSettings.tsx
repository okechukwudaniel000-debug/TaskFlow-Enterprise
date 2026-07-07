/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, Shield, Key, Bell, Globe, Sparkles, Check, CheckCircle, RefreshCw 
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";

export const UserProfileSettings: React.FC = () => {
  const { currentUser, updateProfile, theme, setThemePreference } = useTaskFlow();

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [timezone, setTimezone] = useState(currentUser?.timezone || "America/Los_Angeles");
  const [language, setLanguage] = useState(currentUser?.language || "en");

  // Notifications toggles
  const [emailNotify, setEmailNotify] = useState(true);
  const [slackNotify, setSlackNotify] = useState(false);
  const [browserNotify, setBrowserNotify] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // simulated lag
      updateProfile({
        name,
        bio,
        timezone,
        language
      });
      setSuccessMsg("Profile configuration saved successfully.");
    } catch (err) {
      setErrorMsg("Failed to save profile. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Secure password reset complete. Please memorize the new parameters.");
    } catch (err) {
      setErrorMsg("Failed to update credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const TIMEZONES = [
    { value: "America/Los_Angeles", label: "Pacific Time (PT) - UTC-8" },
    { value: "America/Denver", label: "Mountain Time (MT) - UTC-7" },
    { value: "America/Chicago", label: "Central Time (CT) - UTC-6" },
    { value: "America/New_York", label: "Eastern Time (ET) - UTC-5" },
    { value: "Europe/London", label: "London (GMT) - UTC+0" },
    { value: "Europe/Paris", label: "Paris (CET) - UTC+1" },
    { value: "Asia/Tokyo", label: "Tokyo (JST) - UTC+9" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Dynamic Success / Error alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-200 rounded-md flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/20 border border-red-900/30 text-xs text-red-200 rounded-md flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main forms (8 columns) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* General Profile fields Form */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Account Settings
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4.5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#333]"
                />
              </div>

              {/* Email (static display) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Workspace Email (Primary)</label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="w-full bg-[#121212] border border-[#262626] rounded-md p-2.5 text-xs text-zinc-500 cursor-not-allowed font-mono"
                />
              </div>

              {/* Biography */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bio Summary</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Share a short bio with your workspace colleagues..."
                  className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white resize-none outline-none focus:border-[#333]"
                />
              </div>

              {/* Grid: Locale and Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Timezone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Workspace Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white cursor-pointer outline-none focus:border-[#333]"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Localization Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white cursor-pointer outline-none focus:border-[#333]"
                  >
                    <option value="en">English (US/UK)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="ja">日本語 (Japanese)</option>
                  </select>
                </div>

              </div>

              {/* Submit Profile */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Profile Details"}
              </button>
            </form>
          </div>

          {/* Secure Credential update Form */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" /> Update Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4.5">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white outline-none focus:border-[#333]"
                  required
                />
              </div>

              {/* New Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">New Secure Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white outline-none focus:border-[#333]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white outline-none focus:border-[#333]"
                    required
                  />
                </div>
              </div>

              {/* Submit Password */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#1b1b1b] hover:bg-neutral-800 border border-[#262626] disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer"
              >
                Update Password Key
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Theme toggle and notification prefs (4 columns) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Theme selection panel */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Interface Theme
            </h4>
            <div className="flex flex-col gap-2 pt-1.5">
              <button
                onClick={() => setThemePreference("dark")}
                className={`w-full p-2.5 text-xs font-semibold rounded-md border text-left flex items-center justify-between cursor-pointer transition-all ${
                  theme === "dark" 
                    ? "bg-blue-600 border-blue-500 text-white" 
                    : "bg-[#0b0b0b] border-[#262626] text-zinc-400 hover:text-white"
                }`}
              >
                <span>Dark Mode (Enterprise)</span>
                {theme === "dark" && <Check className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setThemePreference("light")}
                className={`w-full p-2.5 text-xs font-semibold rounded-md border text-left flex items-center justify-between cursor-pointer transition-all ${
                  theme === "light" 
                    ? "bg-blue-600 border-blue-500 text-white" 
                    : "bg-[#0b0b0b] border-[#262626] text-zinc-400 hover:text-white"
                }`}
              >
                <span>Light Mode</span>
                {theme === "light" && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setThemePreference("system")}
                className={`w-full p-2.5 text-xs font-semibold rounded-md border text-left flex items-center justify-between cursor-pointer transition-all ${
                  theme === "system" 
                    ? "bg-blue-600 border-blue-500 text-white" 
                    : "bg-[#0b0b0b] border-[#262626] text-zinc-400 hover:text-white"
                }`}
              >
                <span>System Sync Theme</span>
                {theme === "system" && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Real-time notifications preference checklist toggles */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-400" /> Notification Channels
            </h4>
            
            <div className="space-y-3 pt-1">
              {/* Email Channel */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs text-zinc-400">Email Updates (Primary)</span>
                <input
                  type="checkbox"
                  checked={emailNotify}
                  onChange={(e) => setEmailNotify(e.target.checked)}
                  className="rounded bg-[#0b0b0b] border border-[#262626] text-blue-600 w-4 h-4"
                />
              </label>

              {/* Slack Channel */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs text-zinc-400">Slack Dispatcher integration</span>
                <input
                  type="checkbox"
                  checked={slackNotify}
                  onChange={(e) => setSlackNotify(e.target.checked)}
                  className="rounded bg-[#0b0b0b] border border-[#262626] text-blue-600 w-4 h-4"
                />
              </label>

              {/* Browser notification channel */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs text-zinc-400">In-App Browser Push alerts</span>
                <input
                  type="checkbox"
                  checked={browserNotify}
                  onChange={(e) => setBrowserNotify(e.target.checked)}
                  className="rounded bg-[#0b0b0b] border border-[#262626] text-blue-600 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Secure connected accounts overview */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Enterprise Integrations
            </h4>
            <div className="space-y-2 pt-1">
              <div className="p-2.5 bg-[#0b0b0b] rounded-md border border-[#262626] flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">GitHub Enterprise</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/40 font-mono">CONNECTED</span>
              </div>
              <div className="p-2.5 bg-[#0b0b0b] rounded-md border border-[#262626] flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Slack Workspace</span>
                <span className="text-[10px] text-zinc-500 bg-[#1a1a1a] px-2 py-0.5 rounded font-mono">UNLINKED</span>
              </div>
              <div className="p-2.5 bg-[#0b0b0b] rounded-md border border-[#262626] flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Google Calendar Sync</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/40 font-mono">ACTIVE</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
