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
  Plus, Search, Info, Settings, Trash2, Mail, 
  Sparkles, ShieldCheck, Laptop, Eye
} from "lucide-react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export const DesignSystemPlayground: React.FC = () => {
  const { success, error, warn, info } = useToast();
  const { colors } = useMilitaryTheme();
  
  // Playground state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [inputDemoValue, setInputDemoValue] = useState("");
  const [inputDemoError, setInputDemoError] = useState("");
  const [selectedDropdownValue, setSelectedDropdownValue] = useState("prod");
  const [buttonLoading, setButtonLoading] = useState(false);

  // Dropdown options
  const envOptions = [
    { value: "dev", label: "DEVELOPMENT (LOCAL NODE)" },
    { value: "staging", label: "STAGING REPLICA" },
    { value: "prod", label: "US EAST PRODUCTION GATEWAY" },
    { value: "failover", label: "BACKUP FAILOVER SERVER" },
  ];

  // Table mock data
  const mockTableUsers = [
    { id: "USR-9104", name: "Alaric Sterling", role: "SITE RELIABILITY ARCHITECT", status: "ACTIVE", latency: "14MS" },
    { id: "USR-2384", name: "Beatrix Vance", role: "DEVOPS ENGINEER", status: "BUSY", latency: "45MS" },
    { id: "USR-4920", name: "Cassius Locke", role: "LEAD UI CRAFTSMAN", status: "ACTIVE", latency: "2MS" },
    { id: "USR-1102", name: "Evelyn Graves", role: "PRINCIPAL DATABASE ENGINEER", status: "OFFLINE", latency: "N/A" },
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
      setInputDemoError("TEXT IS TOO SHORT (MINIMUM 5 CHARACTERS REQUIRED)");
    } else {
      setInputDemoError("");
    }
  };

  return (
    <div className="p-5 space-y-8 text-neutral-300 font-mono relative z-10">
      
      {/* Design System Intro */}
      <div className="bg-black/40 border border-white/[0.04] p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4 uppercase">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 rounded-sm shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-white tracking-widest">TACTICAL COMPONENT DESIGN PLAYGROUND</h4>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5 tracking-wide">
              EVALUATING SYSTEM ATOMIC ELEMENTS, ARIA KEYBOARD REGISTRATION, AND ALERT DISPATCH CHANNELS.
            </p>
          </div>
        </div>
        <div className="text-[9px] font-mono text-zinc-500 bg-black/40 border border-white/[0.04] px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 shrink-0 uppercase font-extrabold tracking-wider">
          <ShieldCheck className="text-emerald-400 w-4 h-4" />
          <span>WAI-ARIA COMPLIANT</span>
        </div>
      </div>

      {/* Grid: 2 columns of interactive playground areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: Buttons & Interactive Loading States */}
        <Card className="bg-black/35 rounded-sm border-white/[0.04]">
          <CardHeader>
            <div>
              <CardTitle className="text-[10px] font-extrabold text-white uppercase tracking-widest">1. REUSABLE BUTTON PRIMITIVES</CardTitle>
              <CardDescription className="text-[9px] text-zinc-500 uppercase">STYLE SELECTIONS, HEIGHT REGULATION, AND SPIN STATUS.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">STYLE VARIANTS</span>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">PRIMARY RECON</Button>
                <Button variant="secondary">SECONDARY GUNMETAL</Button>
                <Button variant="outline">BORDER OUTLINE</Button>
                <Button variant="ghost">GHOST MARKER</Button>
                <Button variant="danger">HOSTILE DANGER</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">SCALE REGISTERS & SYMBOL INSERTS</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary" size="xs" leftIcon={<Plus className="w-3 h-3" />}>EXTRA SMALL</Button>
                <Button variant="secondary" size="sm" rightIcon={<Settings className="w-3.5 h-3.5" />}>SMALL TOOL</Button>
                <Button variant="outline" size="md">STANDARD MEDIUM</Button>
                <Button variant="danger" size="lg" leftIcon={<Trash2 className="w-4 h-4" />}>LARGE ERASE</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">ASYNC LOAD & DISABLED BLOCKERS</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  variant="primary" 
                  isLoading={buttonLoading} 
                  onClick={handleTriggerButtonLoad}
                >
                  RUN 2S API TELEMETRY
                </Button>
                <Button variant="secondary" disabled>INHIBITED STATE</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Form Input Field and Validations */}
        <Card className="bg-black/35 rounded-sm border-white/[0.04]">
          <CardHeader>
            <div>
              <CardTitle className="text-[10px] font-extrabold text-white uppercase tracking-widest">2. DATA ENTRY INPUTS</CardTitle>
              <CardDescription className="text-[9px] text-zinc-500 uppercase">FOCUS BORDERS, EMBEDDED ICONS, AND ALARM HIGHLIGHTS.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              label="SECURE EMAIL CONTACT ADDRESS"
              placeholder="operator@central.mil"
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Security parameters prevent un-hashed outbox routing."
            />

            <Input 
              label="FUZZY REGISTER QUERY SEARCH"
              placeholder="Type index registry code..."
              rightIcon={<Search className="w-4 h-4" />}
            />

            <Input 
              label="MINIMUM LENGTH CIPHER CHECKER"
              placeholder="Input 5+ cipher keys..."
              value={inputDemoValue}
              onChange={(e) => handleValidateInput(e.target.value)}
              error={inputDemoError}
              helperText="Fewer than 5 characters registers an inline system warning."
            />
          </CardContent>
        </Card>

        {/* SECTION 3: Keyboard Navigable Dropdowns */}
        <Card className="bg-black/35 rounded-sm border-white/[0.04]">
          <CardHeader>
            <div>
              <CardTitle className="text-[10px] font-extrabold text-white uppercase tracking-widest">3. ACCESSIBLE DROPDOWNS</CardTitle>
              <CardDescription className="text-[9px] text-zinc-500 uppercase">ARROW CYCLE TRACKING, ESCAPE DISMISSAL, AND SELECTION METRICS.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">TARGET ENVIRONMENT SUBNET</span>
              <div className="flex items-center gap-4 bg-black/40 p-4 border border-white/[0.04] rounded-sm">
                <Dropdown 
                  items={envOptions} 
                  onSelect={(val) => {
                    setSelectedDropdownValue(val);
                    success(`Switched target cluster to ${val.toUpperCase()}`);
                  }} 
                  selectedValue={selectedDropdownValue}
                />
                
                <div className="text-[10px]">
                  <span className="text-zinc-500 block text-[8px] uppercase tracking-widest font-extrabold">ACTIVE GATEWAY</span>
                  <strong className="text-white font-extrabold">{envOptions.find(o => o.value === selectedDropdownValue)?.label}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 border border-white/[0.04] rounded-sm text-[9px] font-mono text-zinc-500 flex gap-2 uppercase font-extrabold">
              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <p>Keyboard focus instruction: Press <kbd className="bg-neutral-900 px-1 py-0.2 rounded border border-neutral-700 text-neutral-300">Space / Enter</kbd> on the dropdown button to open, use <kbd className="bg-neutral-900 px-1 py-0.2 rounded border border-neutral-700 text-neutral-300">Arrow Up/Down</kbd> to cycle items, and press <kbd className="bg-neutral-900 px-1 py-0.2 rounded border border-neutral-700 text-neutral-300">Enter</kbd> to select.</p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: Micro-Interactions & Popovers (Modal, Tooltip, Avatar, Toast) */}
        <Card className="bg-black/35 rounded-sm border-white/[0.04]">
          <CardHeader>
            <div>
              <CardTitle className="text-[10px] font-extrabold text-white uppercase tracking-widest">4. PORTAL SYSTEMS & micro-interactions</CardTitle>
              <CardDescription className="text-[9px] text-zinc-500 uppercase">REAL-TIME OVERLAYS, ALT AVATARS, AND ANNOTATION POP-UPS.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Toast controllers */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">DISPATCH TOAST INDICES</span>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" className="text-emerald-400 hover:text-emerald-300" onClick={() => success("Security partition rebuilt!")}>Success</Button>
                <Button variant="secondary" size="sm" className="text-red-400 hover:text-red-300" onClick={() => error("Database connection timed out!")}>Error</Button>
                <Button variant="secondary" size="sm" className="text-amber-400 hover:text-amber-300" onClick={() => warn("High telemetry threshold load (92%).")}>Warning</Button>
                <Button variant="secondary" size="sm" className="text-blue-400 hover:text-blue-300" onClick={() => info("Retrieving latest registry logs...")}>Info</Button>
              </div>
            </div>

            {/* Avatars with multiple sizes & deterministic color fallbacks */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">OPERATOR CALIBRATED AVATARS</span>
              <div className="flex items-center gap-4 bg-black/40 border border-white/[0.04] p-3 rounded-sm">
                <div className="flex items-center gap-2">
                  <Avatar size="xs" name="John Doe" />
                  <Avatar size="sm" name="Beatrix Vance" />
                  <Avatar size="md" name="Alaric Sterling" />
                  <Avatar size="lg" name="Cassius Locke" />
                  <Avatar size="xl" name="Evelyn Graves" />
                </div>
                <div className="text-[8px] text-zinc-500 uppercase font-extrabold tracking-wider leading-relaxed">
                  <p>Hashed initials and color palettes generated from callsigns.</p>
                </div>
              </div>
            </div>

            {/* Interactive Modals and Tooltips */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">COMMAND DOCK DIALOG</span>
                <Button variant="primary" className="w-full" leftIcon={<Eye className="w-4 h-4" />} onClick={() => setIsDemoModalOpen(true)}>
                  LAUNCH POPUP MODAL
                </Button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">ANCHORED ACCESSIBLE TOOLTIPS</span>
                <div className="flex items-center justify-around h-9 bg-neutral-900 border border-white/[0.04] rounded-sm">
                  <Tooltip content="Tooltip Position Top" position="top">
                    <button className="text-zinc-500 hover:text-white font-mono text-[9px] tracking-widest uppercase cursor-help outline-none focus:text-white font-bold">Top Tip</button>
                  </Tooltip>
                  <Tooltip content="Tooltip Position Bottom" position="bottom">
                    <button className="text-zinc-500 hover:text-white font-mono text-[9px] tracking-widest uppercase cursor-help outline-none focus:text-white font-bold">Bottom Tip</button>
                  </Tooltip>
                  <Tooltip content="Tooltip Position Left" position="left">
                    <button className="text-zinc-500 hover:text-white font-mono text-[9px] tracking-widest uppercase cursor-help outline-none focus:text-white font-bold">Left Tip</button>
                  </Tooltip>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* SECTION 5: Responsive Data Table */}
      <Card className="bg-black/35 rounded-sm border-white/[0.04]">
        <CardHeader>
          <div>
            <CardTitle className="text-[10px] font-extrabold text-white uppercase tracking-widest">5. OPERATIONAL DEPLOYMENT DATA GRID</CardTitle>
            <CardDescription className="text-[9px] text-zinc-500 uppercase">STRICT GRID DENSITY, ALIGNED INDEX CODES, AND RESPONSE INDICES.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RESOURCE CODES</TableHead>
                  <TableHead>FULL OPERATOR SIGNATURE</TableHead>
                  <TableHead>DEPLOYED OPERATIONS ROLE</TableHead>
                  <TableHead>SUBNET LATENCY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTableUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-[10px] text-zinc-500 font-bold">{user.id}</TableCell>
                    <TableCell className="font-bold text-white flex items-center gap-2">
                      <Avatar size="xs" name={user.name} />
                      <span className="uppercase text-[10px]">{user.name}</span>
                    </TableCell>
                    <TableCell className="uppercase text-[10px]">{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-1.5 py-0.5 rounded-sm font-mono text-[9px] font-extrabold ${
                        user.latency === "N/A" 
                          ? "text-zinc-500 bg-neutral-900 border border-neutral-800" 
                          : Number(user.latency.replace("MS", "")) > 30 
                          ? "text-amber-400 bg-amber-950/20 border border-amber-800/20" 
                          : "text-emerald-400 bg-emerald-950/20 border border-emerald-800/20"
                      }`}>
                        {user.latency}
                      </span>
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
        title="SECURE CORE SANDBOX TERMINAL"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDemoModalOpen(false)}>
              ABORT PROTOCOL
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              setIsDemoModalOpen(false);
              success("Credentials synchronized and written to cache!");
            }}>
              SYNC TELEMETRY
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-mono uppercase text-[10px]">
          <p className="text-zinc-300 leading-relaxed">
            You are viewing the interactive Modal primitive. This window intercepts keyboard <kbd className="bg-neutral-800 border border-neutral-700 px-1 py-0.2 text-[9px] rounded text-neutral-300">ESC</kbd> events, has optimized scrolling constraints, and implements visual backdrop blur behind our high contrast shell panel.
          </p>

          <Card className="bg-black/40 border-white/[0.04] rounded-sm">
            <CardContent className="space-y-3.5 p-4">
              <span className="text-[9px] font-bold text-zinc-500 tracking-widest block">CONFIGURE SESSION ENCRYPTION SECRET</span>
              <Input 
                placeholder="INPUT RECON DEPLOY KEY..." 
                leftIcon={<Laptop className="text-zinc-500 w-4 h-4" />}
              />
            </CardContent>
          </Card>
        </div>
      </Modal>

    </div>
  );
};
