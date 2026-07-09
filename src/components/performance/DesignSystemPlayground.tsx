/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Modal, 
  Dropdown, 
  TableContainer, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Avatar, 
  Tooltip,
  useToast
} from "../ui";
import { 
  Plus, Search, Info, Settings, Trash2, Mail, CheckCircle2, 
  Sparkles, ShieldCheck, AlertCircle, HelpCircle, Laptop, Eye
} from "lucide-react";

export const DesignSystemPlayground: React.FC = () => {
  const { success, error, warn, info } = useToast();
  
  // Playground state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [inputDemoValue, setInputDemoValue] = useState("");
  const [inputDemoError, setInputDemoError] = useState("");
  const [selectedDropdownValue, setSelectedDropdownValue] = useState("prod");
  const [buttonLoading, setButtonLoading] = useState(false);

  // Dropdown options
  const envOptions = [
    { value: "dev", label: "Development (Local Node)" },
    { value: "staging", label: "Staging Replica" },
    { value: "prod", label: "US East Production Gateway" },
    { value: "failover", label: "Backup Failover Server" },
  ];

  // Table mock data
  const mockTableUsers = [
    { id: "usr-9104", name: "Alaric Sterling", role: "Site Reliability Architect", status: "Active", latency: "14ms" },
    { id: "usr-2384", name: "Beatrix Vance", role: "DevOps Engineer", status: "Busy", latency: "45ms" },
    { id: "usr-4920", name: "Cassius Locke", role: "Lead UI Craftsman", status: "Active", latency: "2ms" },
    { id: "usr-1102", name: "Evelyn Graves", role: "Principal Database Engineer", status: "Offline", latency: "N/A" },
  ];

  const handleTriggerButtonLoad = () => {
    setButtonLoading(true);
    success("Simulating API asynchronous handshake...");
    setTimeout(() => {
      setButtonLoading(false);
      info("Asynchronous task completed successfully!");
    }, 2000);
  };

  const handleValidateInput = (val: string) => {
    setInputDemoValue(val);
    if (val.length > 0 && val.length < 5) {
      setInputDemoError("Text is too short (Minimum 5 characters required)");
    } else {
      setInputDemoError("");
    }
  };

  return (
    <div className="p-5 space-y-8 text-neutral-300 font-sans">
      
      {/* Design System Intro */}
      <div className="bg-[#121212] border border-neutral-800 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-md shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-200">Interactive Design System Playground</h4>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Testing UI primitives with custom variants, strict keyboard compliance, tooltips, responsive layout states, and portal notifications.
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 bg-[#0b0b0b] border border-neutral-850 px-3 py-1.5 rounded flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="text-emerald-500 w-4 h-4" />
          <span>WAI-ARIA Accessibility Compliant</span>
        </div>
      </div>

      {/* Grid: 2 columns of interactive playground areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: Buttons & Interactive Loading States */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>1. Reusable Buttons</CardTitle>
              <CardDescription>Different style variants, scales, active, disabled, and spinner states.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Variants Showcase</span>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary Accent</Button>
                <Button variant="secondary">Secondary Slate</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Label</Button>
                <Button variant="danger">Danger Red</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Sizes & Icon Layouts</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary" size="xs" leftIcon={<Plus className="w-3 h-3" />}>Extra Small</Button>
                <Button variant="secondary" size="sm" rightIcon={<Settings className="w-3.5 h-3.5" />}>Small Tool</Button>
                <Button variant="outline" size="md">Medium Standard</Button>
                <Button variant="danger" size="lg" leftIcon={<Trash2 className="w-4 h-4" />}>Large Delete</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Interactive Loading & Disable Actions</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  variant="primary" 
                  isLoading={buttonLoading} 
                  onClick={handleTriggerButtonLoad}
                >
                  Trigger 2s API Load
                </Button>
                <Button variant="secondary" disabled>Disabled State</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Form Input Field and Validations */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>2. Input Fields & Inline Validations</CardTitle>
              <CardDescription>Keyboard focus, left/right decorative icons, dynamic error feedback, and helper captions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              label="Standard Email Address"
              placeholder="e.g. user@enterprise.com"
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="We never share development access keys outside this subnet."
            />

            <Input 
              label="Fuzzy Token Search"
              placeholder="Type anything to search..."
              rightIcon={<Search className="w-4 h-4" />}
            />

            <Input 
              label="Dynamic Length Validator"
              placeholder="Type at least 5 letters..."
              value={inputDemoValue}
              onChange={(e) => handleValidateInput(e.target.value)}
              error={inputDemoError}
              helperText="Try typing fewer than 5 characters to trigger the error indicator."
            />
          </CardContent>
        </Card>

        {/* SECTION 3: Keyboard Navigable Dropdowns */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>3. Accessible Dropdown Menu</CardTitle>
              <CardDescription>Keyboard arrow key index tracking, escape dismissal, and selection states.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Select Target Environment Cluster</span>
              <div className="flex items-center gap-4 bg-neutral-900/40 p-4 border border-neutral-800 rounded-lg">
                <Dropdown 
                  items={envOptions} 
                  onSelect={(val) => {
                    setSelectedDropdownValue(val);
                    success(`Switched target cluster to ${val.toUpperCase()}`);
                  }} 
                  selectedValue={selectedDropdownValue}
                />
                
                <div className="text-xs font-mono">
                  <span className="text-zinc-500 block text-[9px] uppercase">Active Option Selected</span>
                  <strong className="text-white font-bold">{envOptions.find(o => o.value === selectedDropdownValue)?.label}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#131313] border border-neutral-850 rounded text-[10px] font-mono text-zinc-500 flex gap-2">
              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <p>Keyboard focus instruction: Press <kbd className="bg-[#1e1e1e] px-1 py-0.2 rounded border border-neutral-800 text-neutral-300">Space / Enter</kbd> on the dropdown button to open, use <kbd className="bg-[#1e1e1e] px-1 py-0.2 rounded border border-neutral-800 text-neutral-300">Arrow Up/Down</kbd> to cycle items, and press <kbd className="bg-[#1e1e1e] px-1 py-0.2 rounded border border-neutral-800 text-neutral-300">Enter</kbd> to select.</p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: Micro-Interactions & Popovers (Modal, Tooltip, Avatar, Toast) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>4. Toast Alerts, Avatars, Tooltips & Modal</CardTitle>
              <CardDescription>Interactive real-time notification overlays, alt fallbacks, and dialog transitions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Toast controllers */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Trigger Dynamic Toasts</span>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" className="text-emerald-400 hover:text-emerald-300" onClick={() => success("Security partition rebuilt!")}>Success</Button>
                <Button variant="secondary" size="sm" className="text-red-400 hover:text-red-300" onClick={() => error("Database cluster connection timed out!")}>Error</Button>
                <Button variant="secondary" size="sm" className="text-amber-400 hover:text-amber-300" onClick={() => warn("High server CPU threshold (92% load).")}>Warning</Button>
                <Button variant="secondary" size="sm" className="text-blue-400 hover:text-blue-300" onClick={() => info("Retrieving latest client logs...")}>Info</Button>
              </div>
            </div>

            {/* Avatars with multiple sizes & deterministic color fallbacks */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Avatars & Deterministic Color Fallbacks</span>
              <div className="flex items-center gap-4 bg-neutral-900/30 border border-neutral-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Avatar size="xs" name="John Doe" />
                  <Avatar size="sm" name="Beatrix Vance" />
                  <Avatar size="md" name="Alaric Sterling" />
                  <Avatar size="lg" name="Cassius Locke" />
                  <Avatar size="xl" name="Evelyn Graves" />
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  <p>Auto-generates initials & unique eye-safe background blends from user names.</p>
                </div>
              </div>
            </div>

            {/* Interactive Modals and Tooltips */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Modal Dialog Trigger</span>
                <Button variant="primary" className="w-full" leftIcon={<Eye className="w-4 h-4" />} onClick={() => setIsDemoModalOpen(true)}>
                  Open Animated Modal
                </Button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Aria Tooltips Hover/Focus</span>
                <div className="flex items-center justify-around h-9 bg-[#111111] border border-neutral-800 rounded">
                  <Tooltip content="Tooltip Position Top" position="top">
                    <button className="text-zinc-400 hover:text-white font-mono text-[10px] underline cursor-help outline-none focus:text-white">Top Tip</button>
                  </Tooltip>
                  <Tooltip content="Tooltip Position Bottom" position="bottom">
                    <button className="text-zinc-400 hover:text-white font-mono text-[10px] underline cursor-help outline-none focus:text-white">Bottom Tip</button>
                  </Tooltip>
                  <Tooltip content="Tooltip Position Left" position="left">
                    <button className="text-zinc-400 hover:text-white font-mono text-[10px] underline cursor-help outline-none focus:text-white">Left Tip</button>
                  </Tooltip>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* SECTION 5: Responsive Data Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>5. Responsive Enterprise Data Tables</CardTitle>
            <CardDescription>Centralized column parameters, clean padding metrics, and high-visibility typography.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>Full Operator Name</TableHead>
                  <TableHead>Enterprise Staff Role</TableHead>
                  <TableHead>Latency Sync</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTableUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-[11px] text-zinc-500">{user.id}</TableCell>
                    <TableCell className="font-bold text-white flex items-center gap-2">
                      <Avatar size="xs" name={user.name} />
                      <span>{user.name}</span>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold ${
                        user.latency === "N/A" 
                          ? "text-zinc-500 bg-neutral-900" 
                          : Number(user.latency.replace("ms", "")) > 30 
                          ? "text-amber-400 bg-amber-950/20" 
                          : "text-emerald-400 bg-emerald-950/20"
                      }`}>
                        {user.latency}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="xs" onClick={() => info(`Inspecting operator credentials for ${user.name}`)}>
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* DEMO MODAL TRIGGER CONTENT */}
      <Modal 
        isOpen={isDemoModalOpen} 
        onClose={() => {
          setIsDemoModalOpen(false);
          info("Modal safely dismissed.");
        }}
        title="Secure Kernel Sandbox Shell"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDemoModalOpen(false)}>
              Bypass Shell
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              setIsDemoModalOpen(false);
              success("Credentials synchronized and written to cache!");
            }}>
              Sync Settings
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-300 leading-relaxed font-sans text-xs">
            You are viewing the interactive Modal primitive. This window intercepts keyboard <kbd className="bg-neutral-800 border border-neutral-700 px-1 py-0.2 text-[10px] rounded text-neutral-300">ESC</kbd> events, has optimized scrolling constraints, and implements visual backdrop blur behind our high contrast shell panel.
          </p>

          <Card className="bg-[#181818]/40 border-neutral-850">
            <CardContent className="space-y-3.5 p-4">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">Configure Dialog Token Key</span>
              <Input 
                placeholder="Paste distributed session secret key..." 
                leftIcon={<Laptop className="text-zinc-600 w-4 h-4" />}
              />
            </CardContent>
          </Card>
        </div>
      </Modal>

    </div>
  );
};
