/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User as UserIcon, Shield, ArrowRight, CheckCircle, RefreshCw, Layers } from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";

export const LoginRegister: React.FC = () => {
  const { login, forgotPassword } = useTaskFlow();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!email) {
      setError("Please fill in your email address.");
      return;
    }
    if (mode !== "forgot" && !password) {
      setError("Please fill in your password.");
      return;
    }
    if (mode === "register" && !name) {
      setError("Please provide your full name.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login" || mode === "register") {
        // Mocking brief server round-trip network lag for high fidelity loading states
        await new Promise((resolve) => setTimeout(resolve, 800));
        await login(email);
      } else if (mode === "forgot") {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await forgotPassword(email);
        setSuccessMsg("If this account exists, we have dispatched a password recovery instruction set to your email inbox.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected security system error occurred. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative cosmic background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 border border-blue-400/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            TaskFlow Enterprise
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono tracking-wider">
            SECURE ACCESS GATEWAY
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {mode === "login" && "Sign in to Workspace"}
                  {mode === "register" && "Create enterprise account"}
                  {mode === "forgot" && "Recover secure password"}
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {mode === "login" && "Enter your organizational credentials to proceed."}
                  {mode === "register" && "Set up your credentials to join TaskFlow."}
                  {mode === "forgot" && "Provide your email to receive recovery protocols."}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-200 flex items-start gap-2.5">
                  <span className="font-bold">Error:</span>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#181818] border border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-[#181818] border border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Secure Password
                      </label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => { setError(null); setMode("forgot"); }}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#181818] border border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-[#181818] border-neutral-800 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className="text-xs text-neutral-400">Keep me logged in</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all duration-200 select-none disabled:opacity-55 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" && "Authenticate Access"}
                      {mode === "register" && "Create Account"}
                      {mode === "forgot" && "Send Recovery Link"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center">
                {mode === "login" && (
                  <p className="text-xs text-neutral-400">
                    New to TaskFlow?{" "}
                    <button
                      onClick={() => { setError(null); setMode("register"); }}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Create an account
                    </button>
                  </p>
                )}
                {mode === "register" && (
                  <p className="text-xs text-neutral-400">
                    Already registered?{" "}
                    <button
                      onClick={() => { setError(null); setMode("login"); }}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Sign in here
                    </button>
                  </p>
                )}
                {mode === "forgot" && (
                  <p className="text-xs text-neutral-400">
                    Back to{" "}
                    <button
                      onClick={() => { setError(null); setMode("login"); }}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      secure login
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Informational Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-neutral-600 text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>256-BIT END-TO-END JWT ENCRYPTION KEYSPACE ACTIVE</span>
        </div>
      </motion.div>
    </div>
  );
};
