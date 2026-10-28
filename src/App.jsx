import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  TerminalWindow,
  Speedometer,
  Network,
  Cpu,
  Hash,
  Info,
  SplitHorizontal,
  MapPin,
  Question,
} from "@phosphor-icons/react";
import { ThemeToggle } from "./components/ThemeToggle";
import { MyIpWidget } from "./components/MyIpWidget";
import { ToolHeader } from "./components/ui/ToolHeader";
import { SubnetCalculator } from "./components/tools/SubnetCalculator";
import { MembershipTool } from "./components/tools/MembershipTool";
import { MasksTool } from "./components/tools/MasksTool";
import { IpInfoTool } from "./components/tools/IpInfoTool";
import { SplitTool } from "./components/tools/SplitTool";
import { LocateTool } from "./components/tools/LocateTool";
import { useMyIp } from "./hooks/useMyIp";
import { AboutTool } from "./components/tools/AboutTool";
import { BenchmarkTool } from "./components/tools/BenchmarkTool";
import "./styles/tools.css";

const TOOLS = [
  {
    id: "benchmark",
    label: "Benchmark",
    icon: Speedometer,
    eyebrow: "Quality benchmark",
    chip: "speed.cloudflare.com",
    desc: "Long-run internet quality tester: does your speed hold over time?",
  },
  {
    id: "subnet",
    label: "Subnet",
    icon: Network,
    eyebrow: "IPv4 calculator",
    chip: "100% offline",
    desc: "Network, broadcast, host range, and wildcard from an IP plus mask.",
  },
  {
    id: "member",
    label: "Membership",
    icon: Cpu,
    eyebrow: "IPv4 calculator",
    chip: "100% offline",
    desc: "Test whether a host address falls inside a CIDR.",
  },
  {
    id: "mask",
    label: "Masks",
    icon: Hash,
    eyebrow: "IPv4 calculator",
    chip: "100% offline",
    desc: "Convert prefix and dotted masks, or size for a host count.",
  },
  {
    id: "info",
    label: "IP info",
    icon: Info,
    eyebrow: "IPv4 & IPv6",
    chip: "100% offline",
    desc: "Classify IPv4 or IPv6: kind, type, binary, and integer forms.",
  },
  {
    id: "split",
    label: "Split",
    icon: SplitHorizontal,
    eyebrow: "IPv4 calculator",
    chip: "100% offline",
    desc: "Carve a parent CIDR into equal child subnets.",
  },
  {
    id: "locate",
    label: "Locate",
    icon: MapPin,
    eyebrow: "Geo lookup",
    chip: "public geo APIs",
    desc: "See your public IP on the map, or look up any address (no API key).",
  },
  {
    id: "about",
    label: "About",
    icon: Question,
    eyebrow: "Project info",
    chip: "credits & attribution",
    desc: "Project information, credits, and acknowledgments.",
  },
];

function getInitialTool() {
  try {
    const param = new URLSearchParams(window.location.search).get("tool");
    if (TOOLS.some((t) => t.id === param)) return param;
  } catch {}
  return "subnet";
}

export function App() {
  const prefersReducedMotion = useReducedMotion();
  const myIpState = useMyIp();
  const [activeTool, setActiveTool] = useState(getInitialTool);
  const [presetIp, setPresetIp] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (activeTool === "subnet") {
        url.searchParams.delete("tool");
      } else {
        url.searchParams.set("tool", activeTool);
      }
      window.history.replaceState({}, "", url);
    } catch {}
  }, [activeTool]);

  const currentToolObj = TOOLS.find((t) => t.id === activeTool) || TOOLS[0];
  const detectedIp = myIpState.status === "ready" ? myIpState.data.ip : null;

  return (
    <div className="app-layout-wrapper flex min-h-dvh w-full flex-col lg:flex-row">
      <a
        href="#main"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-sticky) focus:inline-flex focus:rounded-[2px] focus:bg-(--accent) focus:px-3 focus:py-2 focus:text-sm focus:text-(--btn-primary-text)"
      >
        Skip to main content
      </a>

      <aside className="app-sidebar flex shrink-0 flex-col border-b border-(--border) bg-(--rail) lg:border-b-0 lg:border-r">
        <div className="flex items-start justify-between gap-3 px-4 py-4 lg:flex-col lg:items-stretch lg:px-5 lg:py-6">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-(--muted)">
              <TerminalWindow
                size={12}
                weight="bold"
                className="text-(--accent)"
                aria-hidden="true"
              />
              Local
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-(--ink)">
              SpeedBench
            </h1>
            <p className="mt-1 hidden max-w-[20ch] text-xs leading-relaxed text-(--muted) lg:block">
              IPv4 math offline. Locate uses free geo APIs.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <nav aria-label="Tools" className="px-2 pb-3 lg:flex-1 lg:px-3">
          <ul className="toolkit-nav flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TOOLS.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <li key={tool.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (tool.id !== "locate") setPresetIp(null);
                      setActiveTool(tool.id);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "toolkit-nav-btn flex w-full items-center gap-2 rounded-[2px] px-3 py-2 text-left text-sm font-medium transition-[background-color,color] duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) active:scale-[0.99]",
                      isActive
                        ? "bg-(--accent) text-(--btn-primary-text)"
                        : "text-(--muted) hover:bg-(--hover) hover:text-(--ink)",
                    ].join(" ")}
                  >
                    <span className="toolkit-nav-icon" aria-hidden="true">
                      <tool.icon size={12} weight="bold" />
                    </span>
                    {tool.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <MyIpWidget
          myIp={myIpState}
          onShowMap={(ip) => {
            setPresetIp(ip);
            setRefreshKey((k) => k + 1);
            setActiveTool("locate");
          }}
        />

        <p className="hidden border-t border-(--border) px-5 py-4 font-mono text-[0.65rem] leading-relaxed text-(--muted) lg:block">
          /31 = RFC 3021 · /32 = host route
        </p>
      </aside>

      <div className="app-main-content flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <motion.header
          className="mb-6"
          initial={!prefersReducedMotion && { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <ToolHeader
            icon={<currentToolObj.icon size={22} weight="bold" />}
            eyebrow={currentToolObj.eyebrow}
            title={currentToolObj.label}
            description={currentToolObj.desc}
            chips={[currentToolObj.chip].filter(Boolean)}
          />
        </motion.header>

        <main id="main" className="flex-1">
          <motion.div
            key={activeTool}
            initial={!prefersReducedMotion && { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTool === "subnet" && <SubnetCalculator />}
            {activeTool === "benchmark" && <BenchmarkTool />}
            {activeTool === "member" && <MembershipTool />}
            {activeTool === "mask" && <MasksTool />}
            {activeTool === "info" && <IpInfoTool myIp={detectedIp} />}
            {activeTool === "split" && <SplitTool />}
            {activeTool === "locate" && (
              <LocateTool
                key={refreshKey}
                presetIp={presetIp}
                myIp={detectedIp}
              />
            )}
            {activeTool === "about" && <AboutTool />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
