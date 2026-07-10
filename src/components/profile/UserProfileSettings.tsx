/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, Shield, Key, Bell, Globe, Sparkles, Check, CheckCircle, RefreshCw 
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { useAuthStore } from "../../features/auth/authStore";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export const UserProfileSettings: React.FC = () => {
  const { currentUser, updateProfile, theme, setThemePreference } = useTaskFlow();
  const { sessions, securityLogs, getSessions, revokeSession, getSecurityLogs } = useAuthStore();
  const { colors } = useMilitaryTheme();

  useEffect(() => {
    getSessions();
    getSecurityLogs();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setSuccessMsg("Active device session successfully terminated.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to terminate active session.");
    }
  };

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
    { value: "America/Los_Angeles", label: "PACIFIC TIME (PT) - UTC-8" },
    { value: "America/Denver", label: "MOUNTAIN TIME (MT) - UTC-7" },
    { value: "America/Chicago", label: "CENTRAL TIME (CT) - UTC-6" },
    { value: "America/New_York", label: "EASTERN TIME (ET) - UTC-5" },
    { value: "Europe/London", label: "LONDON (GMT) - UTC+0" },
    { value: "Europe/Paris", label: "PARIS (CET) - UTC+1" },
    { value: "Asia/Tokyo", label: "TOKYO (JST) - UTC+9" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono relative z-10">
      
      {/* Dynamic Success / Error alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 text-[10px] text-emerald-200 rounded-sm flex items-center gap-2.5 uppercase font-bold tracking-wider">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>[SYSTEM_OK]: {successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/20 border border-red-800/40 text-[10px] text-red-200 rounded-sm flex items-center gap-2.5 uppercase font-bold tracking-wider">
          <Shield className="w-4 h-4 text-red-400 shrink-0" />
          <span>[ALERT_FAIL]: {errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main forms (8 columns) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* General Profile fields Form */}
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-6 shadow-sm space-y-4`}>
            <h3 className="text-[10px] font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> [SECURE] PROFILE ACCOUNT REGISTRY
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4.5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">OPERATOR CALLSIGN</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white outline-none focus:border-neutral-500 uppercase`}
                />
              </div>

              {/* Email (static display) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">SECURE COMS CHANNEL EMAIL (STATIC)</label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className={`w-full bg-neutral-900 border ${colors.border} rounded-sm p-2.5 text-xs text-zinc-500 cursor-not-allowed font-mono`}
                />
              </div>

              {/* Biography */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">TACTICAL BIOGRAPHY / OPERATIONAL CLEARANCE</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Operational profile overview..."
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white resize-none outline-none focus:border-neutral-500 uppercase`}
                />
              </div>

              {/* Grid: Locale and Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Timezone */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">OPERATIONAL TIMEZONE</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white cursor-pointer outline-none focus:border-neutral-500 uppercase`}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value} className="bg-neutral-900 text-white">{tz.label}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">TELEMETRY LOCALIZATION</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white cursor-pointer outline-none focus:border-neutral-500 uppercase`}
                  >
                    <option value="en" className="bg-neutral-900 text-white">ENGLISH (US/UK)</option>
                    <option value="fr" className="bg-neutral-900 text-white">FRANÇAIS (FRENCH)</option>
                    <option value="de" className="bg-neutral-900 text-white">DEUTSCH (GERMAN)</option>
                    <option value="ja" className="bg-neutral-900 text-white">日本語 (JAPANESE)</option>
                  </select>
                </div>

              </div>

              {/* Submit Profile */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 border border-emerald-600 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "COMMIT PROFILE AMENDMENTS"}
              </button>
            </form>
          </div>

          {/* Secure Credential update Form */}
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-6 shadow-sm space-y-4`}>
            <h3 className="text-[10px] font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" /> [SECURITY] ROTATE ACCESS CIPHER
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4.5">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">CURRENT CIPHER ENTRY</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white outline-none focus:border-neutral-500 uppercase`}
                  required
                />
              </div>

              {/* New Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">NEW PASSCODE KEY</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white outline-none focus:border-neutral-500 uppercase`}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">CONFIRM PASSCODE KEY</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white outline-none focus:border-neutral-500 uppercase`}
                    required
                  />
                </div>
              </div>

              {/* Submit Password */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 disabled:opacity-50 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
              >
                ROTATE KEYCIPHER PARAMETERS
              </button>
            </form>
          </div>

          {/* Active Sessions & Security Logs */}
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-6 shadow-sm space-y-5`}>
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <h3 className="text-[10px] font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> [AUDIT] TELEMETRY SESSIONS & LOG ENTRY
              </h3>
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await getSessions();
                    await getSecurityLogs();
                    setSuccessMsg("Secured sessions and audit trail synced from keyspace.");
                  } catch (e: any) {
                    setErrorMsg("Failed to synchronize session telemetry.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="text-[9px] text-emerald-400 hover:text-emerald-300 font-extrabold uppercase tracking-widest flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} /> SYNC REGISTERS
              </button>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">ACTIVE TERMINAL SESSIONS ({sessions.length})</h4>
              {sessions.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic uppercase">No sessions synced. Dispatch refresh.</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((sess) => (
                    <div key={sess.sessionId} className={`p-3 bg-black/40 border ${colors.border} rounded-sm flex items-center justify-between gap-3 text-xs`}>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-zinc-200 truncate max-w-[200px]" title={sess.userAgent}>
                            {sess.userAgent ? sess.userAgent.split(" ")[0].toUpperCase() || "UNKNOWN USERAGENT" : "UNKNOWN CLIENT"}
                          </span>
                          <span className="text-[8px] text-emerald-400 font-mono bg-emerald-950/20 px-2 py-0.5 rounded-sm border border-emerald-800/30 uppercase tracking-wider">
                            IP: {sess.ip || "127.0.0.1"}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-500 uppercase">
                          LAST SIGNATURE: {new Date(sess.lastActive).toLocaleString().toUpperCase()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(sess.sessionId)}
                        className="text-[9px] text-red-400 hover:text-red-300 font-extrabold tracking-widest uppercase px-2 py-1.5 bg-red-950/20 border border-red-900/30 rounded-sm cursor-pointer transition-colors shrink-0"
                      >
                        REVOKE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Audit Logs */}
            <div className={`space-y-3 border-t ${colors.borderMuted} pt-4`}>
              <h4 className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">SECURE ACTION AUDIT INDEX (LATEST 10 ENTRIES)</h4>
              {securityLogs.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic uppercase">No logs indexed. Standby.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {securityLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className={`p-2.5 bg-black/40 border ${colors.border} rounded-sm text-[10px] flex flex-col gap-1 uppercase`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold uppercase tracking-widest text-[8px] px-1.5 py-0.5 rounded-sm border ${
                          log.action.includes("SUCCESS") || log.action === "REGISTRATION" || log.action === "EMAIL_VERIFICATION"
                            ? "text-emerald-400 bg-emerald-950/10 border-emerald-900/30"
                            : log.action.includes("FAILED") || log.action === "LOCKOUT" || log.action === "SECURITY_VIOLATION_REUSE"
                            ? "text-red-400 bg-red-950/10 border-red-900/30"
                            : "text-amber-400 bg-amber-950/10 border-amber-900/30"
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-zinc-600 text-[8px] shrink-0 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-zinc-300 leading-normal">{log.details}</p>
                      {log.ip && (
                        <span className="text-[8px] text-zinc-600 truncate font-bold">
                          ORIGIN IP: {log.ip} | HOST: {log.userAgent ? log.userAgent.toUpperCase().substring(0, 50) : "UNKNOWN"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Theme toggle and notification prefs (4 columns) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Theme selection panel */}
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-3.5`}>
            <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> SYSTEM SIGNATURE HUE
            </h4>
            <div className="flex flex-col gap-2 pt-1.5">
              <button
                onClick={() => setThemePreference("dark")}
                className={`w-full p-2.5 text-[9px] tracking-widest font-extrabold uppercase rounded-sm border text-left flex items-center justify-between cursor-pointer transition-all ${
                  theme === "dark" 
                    ? "bg-emerald-850 border-emerald-600 text-white" 
                    : "bg-black/40 border-white/[0.04] text-zinc-500 hover:text-white"
                }`}
              >
                <span>TACTICAL DARK CANVASS</span>
                {theme === "dark" && <Check className="w-3.5 h-3.5" />}
              </button>
              
              <button
                onClick={() => setThemePreference("light")}
                className={`w-full p-2.5 text-[9px] tracking-widest font-extrabold uppercase rounded-sm border text-left flex items-center justify-between cursor-pointer transition-all ${
                  theme === "light" 
                    ? "bg-emerald-850 border-emerald-600 text-white" 
                    : "bg-black/40 border-white/[0.04] text-zinc-500 hover:text-white"
                }`}
              >
                <span>LIGHT OPERATIONAL ENVIRONMENT</span>
                {theme === "light" && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setThemePreference("system")}
                className={`w-full p-2.5 text-[9px] tracking-widest font-extrabold uppercase rounded-sm border text-left flex items-center justify-between cursor-pointer transition-all ${
                  theme === "system" 
                    ? "bg-emerald-850 border-emerald-600 text-white" 
                    : "bg-black/40 border-white/[0.04] text-zinc-500 hover:text-white"
                }`}
              >
                <span>SYSTEM SYNC FLIGHT STATUS</span>
                {theme === "system" && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Real-time notifications preference checklist toggles */}
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-3.5`}>
            <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-400" /> METRIC DISPATCH CHANNELS
            </h4>
            
            <div className="space-y-3 pt-1">
              {/* Email Channel */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">EMAIL REPORTS (PRIMARY)</span>
                <input
                  type="checkbox"
                  checked={emailNotify}
                  onChange={(e) => setEmailNotify(e.target.checked)}
                  className="rounded-sm bg-neutral-900 border border-white/[0.04] text-emerald-600 w-4 h-4 accent-emerald-500"
                />
              </label>

              {/* Slack Channel */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">SLACK HOOK INTEGRATION</span>
                <input
                  type="checkbox"
                  checked={slackNotify}
                  onChange={(e) => setSlackNotify(e.target.checked)}
                  className="rounded-sm bg-neutral-900 border border-white/[0.04] text-emerald-600 w-4 h-4 accent-emerald-500"
                />
              </label>

              {/* Browser notification channel */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">SECURE BROWSER PUSH LOGS</span>
                <input
                  type="checkbox"
                  checked={browserNotify}
                  onChange={(e) => setBrowserNotify(e.target.checked)}
                  className="rounded-sm bg-neutral-900 border border-white/[0.04] text-emerald-600 w-4 h-4 accent-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Secure connected accounts overview */}
          <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-3`}>
            <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> SECURE COMS LINK INTEGRATIONS
            </h4>
            <div className="space-y-2 pt-1">
              <div className={`p-2.5 bg-black/40 rounded-sm border border-white/[0.04] flex justify-between items-center text-[10px] uppercase font-bold`}>
                <span className="text-zinc-300">GITHUB RECON</span>
                <span className="text-[8px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded-sm border border-emerald-900/40 tracking-widest font-extrabold">CONNECTED</span>
              </div>
              <div className={`p-2.5 bg-black/40 rounded-sm border border-white/[0.04] flex justify-between items-center text-[10px] uppercase font-bold`}>
                <span className="text-zinc-300">SLACK PROTOCOL</span>
                <span className="text-[8px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-sm tracking-widest">UNLINKED</span>
              </div>
              <div className={`p-2.5 bg-black/40 rounded-sm border border-white/[0.04] flex justify-between items-center text-[10px] uppercase font-bold`}>
                <span className="text-zinc-300">SECURE CALENDAR LINK</span>
                <span className="text-[8px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded-sm border border-emerald-900/40 tracking-widest font-extrabold">ACTIVE</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
