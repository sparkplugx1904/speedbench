import React from "react";

/**
 * Visual SVG Architecture Diagram for SpeedBench.
 * Completely responsive and styled using CSS theme variables.
 */
export function ArchitectureDiagram() {
  return (
    <div className="docs-diagram-container" role="img" aria-label="SpeedBench Architecture Diagram">
      <svg
        viewBox="0 0 760 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="docs-diagram-svg"
      >
        <rect
          x="10"
          y="10"
          width="740"
          height="340"
          rx="4"
          className="docs-diag-bg"
          strokeDasharray="4 4"
        />
        <text x="30" y="42" className="docs-diag-title">
          CLIENT BROWSER RUNTIME (100% Offline Sandbox)
        </text>

        {/* UI Layer */}
        <rect x="30" y="60" width="700" height="60" rx="3" className="docs-diag-box docs-diag-box--accent" />
        <text x="50" y="88" className="docs-diag-label-accent">SPEEDBENCH UI LAYER</text>
        <text x="50" y="106" className="docs-diag-sub">React 19 · Vite Monolith Bundle · Framer Motion · Phosphor Icons · Theme Engine</text>

        {/* Math Engine Box */}
        <rect x="30" y="140" width="335" height="130" rx="3" className="docs-diag-box" />
        <text x="50" y="168" className="docs-diag-label">OFFLINE BITWISE MATH ENGINE</text>
        <text x="50" y="190" className="docs-diag-mono">• Subnet Calculator (IPv4/CIDR math)</text>
        <text x="50" y="210" className="docs-diag-mono">• Membership Verification (&gt;&gt;&gt; bitwise)</text>
        <text x="50" y="230" className="docs-diag-mono">• Subnet Splitter &amp; Wildcard Logic</text>
        <text x="50" y="250" className="docs-diag-mono">• IPv4 / IPv6 Parser &amp; Integer Form</text>

        {/* Network & Diagnostics */}
        <rect x="395" y="140" width="335" height="130" rx="3" className="docs-diag-box" />
        <text x="415" y="168" className="docs-diag-label">EXTERNAL NETWORK BOUNDARY</text>
        <text x="415" y="190" className="docs-diag-mono">• Quality Benchmark Engine (4x Streams)</text>
        <text x="415" y="210" className="docs-diag-mono">• Latency &amp; Bufferbloat Probe (4/sec)</text>
        <text x="415" y="230" className="docs-diag-mono">• Public Geo IP Resolvers (Leaflet Map)</text>
        <text x="415" y="250" className="docs-diag-mono">• Zero Telemetry / No Tracking Policy</text>

        {/* Cloudflare Edge Footer Banner */}
        <rect x="30" y="285" width="700" height="50" rx="3" className="docs-diag-box docs-diag-box--edge" />
        <text x="50" y="316" className="docs-diag-label-mono">HOSTING &amp; EDGE: Cloudflare Pages · Global Anycast CDN · speed.cloudflare.com endpoints</text>
      </svg>
    </div>
  );
}

/**
 * Visual SVG Diagram of Benchmark Engine Pipeline.
 */
export function BenchmarkFlowDiagram() {
  return (
    <div className="docs-diagram-container" role="img" aria-label="Benchmark Engine Pipeline Diagram">
      <svg
        viewBox="0 0 760 270"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="docs-diagram-svg"
      >
        <rect x="10" y="10" width="740" height="250" rx="4" className="docs-diag-bg" strokeDasharray="4 4" />
        
        {/* Step 1 */}
        <rect x="30" y="40" width="160" height="190" rx="3" className="docs-diag-box" />
        <circle cx="55" cy="65" r="14" className="docs-diag-step-circle" />
        <text x="51" y="70" className="docs-diag-step-num">1</text>
        <text x="80" y="70" className="docs-diag-label">Initiation</text>
        <text x="45" y="105" className="docs-diag-sub">Mode &amp; Cap Config</text>
        <text x="45" y="130" className="docs-diag-mono">• Continuous or 10s/20s Interval</text>
        <text x="45" y="165" className="docs-diag-mono">• Optional Data Cap (500MB - 10GB)</text>
        <text x="45" y="200" className="docs-diag-mono">• Screen WakeLock API requested</text>

        {/* Arrow 1 */}
        <path d="M 195 135 L 215 135" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="docs-diag-arrow" />

        {/* Step 2 */}
        <rect x="220" y="40" width="160" height="190" rx="3" className="docs-diag-box docs-diag-box--accent" />
        <circle cx="245" cy="65" r="14" className="docs-diag-step-circle docs-diag-step-circle--accent" />
        <text x="241" y="70" className="docs-diag-step-num">2</text>
        <text x="270" y="70" className="docs-diag-label-accent">Load Streams</text>
        <text x="235" y="105" className="docs-diag-sub">Multi-stream Load</text>
        <text x="235" y="130" className="docs-diag-mono">• 4x Parallel HTTP Fetch Streams</text>
        <text x="235" y="165" className="docs-diag-mono">• ReadableStream chunk byte-counting</text>
        <text x="235" y="200" className="docs-diag-mono">• Loop refill upon completion</text>

        {/* Arrow 2 */}
        <path d="M 385 135 L 405 135" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="docs-diag-arrow" />

        {/* Step 3 */}
        <rect x="410" y="40" width="160" height="190" rx="3" className="docs-diag-box" />
        <circle cx="435" cy="65" r="14" className="docs-diag-step-circle" />
        <text x="431" y="70" className="docs-diag-step-num">3</text>
        <text x="460" y="70" className="docs-diag-label">Probe Pulse</text>
        <text x="425" y="105" className="docs-diag-sub">Loaded Latency &amp; Loss</text>
        <text x="425" y="130" className="docs-diag-mono">• 4 Probes/sec with high-res timer</text>
        <text x="425" y="165" className="docs-diag-mono">• RTT &amp; Jitter variance math</text>
        <text x="425" y="200" className="docs-diag-mono">• Bufferbloat impact detection</text>

        {/* Arrow 3 */}
        <path d="M 575 135 L 595 135" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="docs-diag-arrow" />

        {/* Step 4 */}
        <rect x="600" y="40" width="130" height="190" rx="3" className="docs-diag-box" />
        <circle cx="625" cy="65" r="14" className="docs-diag-step-circle" />
        <text x="621" y="70" className="docs-diag-step-num">4</text>
        <text x="650" y="70" className="docs-diag-label">Analysis</text>
        <text x="615" y="105" className="docs-diag-sub">Real-time Stats</text>
        <text x="615" y="130" className="docs-diag-mono">• P95 latency</text>
        <text x="615" y="155" className="docs-diag-mono">• Sustained Mbps</text>
        <text x="615" y="180" className="docs-diag-mono">• Step-down alert</text>
        <text x="615" y="205" className="docs-diag-mono">• JSON export</text>
      </svg>
    </div>
  );
}

/**
 * Visual SVG Diagram for IPv4 Subnetting & CIDR Bitwise Breakdown.
 */
export function SubnetBitwiseDiagram() {
  return (
    <div className="docs-diagram-container" role="img" aria-label="IPv4 Bitwise Structure Diagram">
      <svg
        viewBox="0 0 760 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="docs-diagram-svg"
      >
        <rect x="10" y="10" width="740" height="240" rx="4" className="docs-diag-bg" strokeDasharray="4 4" />
        <text x="30" y="38" className="docs-diag-title">32-BIT IPV4 STRUCTURE (e.g. 192.168.1.130 / 26)</text>

        {/* 4 Octets */}
        <g transform="translate(30, 55)">
          <rect x="0" y="0" width="165" height="70" rx="3" className="docs-diag-box docs-diag-box--accent" />
          <text x="12" y="24" className="docs-diag-label-accent">OCTET 1 (8 bits)</text>
          <text x="12" y="45" className="docs-diag-mono font-bold">11000000</text>
          <text x="12" y="60" className="docs-diag-sub">Decimal: 192</text>

          <rect x="175" y="0" width="165" height="70" rx="3" className="docs-diag-box docs-diag-box--accent" />
          <text x="187" y="24" className="docs-diag-label-accent">OCTET 2 (8 bits)</text>
          <text x="187" y="45" className="docs-diag-mono font-bold">10101000</text>
          <text x="187" y="60" className="docs-diag-sub">Decimal: 168</text>

          <rect x="350" y="0" width="165" height="70" rx="3" className="docs-diag-box docs-diag-box--accent" />
          <text x="362" y="24" className="docs-diag-label-accent">OCTET 3 (8 bits)</text>
          <text x="362" y="45" className="docs-diag-mono font-bold">00000001</text>
          <text x="362" y="60" className="docs-diag-sub">Decimal: 1</text>

          <rect x="525" y="0" width="175" height="70" rx="3" className="docs-diag-box" />
          <text x="537" y="24" className="docs-diag-label">OCTET 4 (8 bits)</text>
          <text x="537" y="45" className="docs-diag-mono font-bold">
            <tspan className="text-(--accent)">10</tspan>000010
          </text>
          <text x="537" y="60" className="docs-diag-sub">Decimal: 130</text>
        </g>

        {/* CIDR Split Bracket */}
        <g transform="translate(30, 140)">
          {/* Network portion (26 bits) */}
          <rect x="0" y="0" width="560" height="42" rx="2" className="docs-diag-box docs-diag-box--accent" />
          <text x="15" y="26" className="docs-diag-label-accent">
            PREFIX / NETWORK BITS (First 26 Bits) → Mask: 255.255.255.192
          </text>

          {/* Host portion (6 bits) */}
          <rect x="568" y="0" width="132" height="42" rx="2" className="docs-diag-box" />
          <text x="578" y="26" className="docs-diag-label">
            HOST (6 Bits = 64)
          </text>
        </g>

        {/* Results summary bar */}
        <g transform="translate(30, 195)">
          <rect x="0" y="0" width="700" height="38" rx="2" className="docs-diag-box docs-diag-box--edge" />
          <text x="15" y="24" className="docs-diag-mono">
            Network: 192.168.1.128 · First: 192.168.1.129 · Last: 192.168.1.190 · Broadcast: 192.168.1.191 · Usable Hosts: 62
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Visual SVG Diagram for Privacy & Data Boundary.
 */
export function PrivacyBoundaryDiagram() {
  return (
    <div className="docs-diagram-container" role="img" aria-label="Privacy and Data Boundary Diagram">
      <svg
        viewBox="0 0 760 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="docs-diagram-svg"
      >
        <rect x="10" y="10" width="740" height="190" rx="4" className="docs-diag-bg" strokeDasharray="4 4" />
        
        {/* Offline Box */}
        <rect x="30" y="35" width="335" height="145" rx="3" className="docs-diag-box docs-diag-box--accent" />
        <text x="50" y="65" className="docs-diag-label-accent">100% OFFLINE DATA ZONE</text>
        <text x="50" y="90" className="docs-diag-mono">✓ Subnetting, masks, splits &amp; CIDRs</text>
        <text x="50" y="115" className="docs-diag-mono">✓ IPv4 / IPv6 bitwise parsing</text>
        <text x="50" y="140" className="docs-diag-mono">✓ Benchmark history (localStorage only)</text>
        <text x="50" y="162" className="docs-diag-sub">No network requests or telemetry created</text>

        {/* Public Box */}
        <rect x="395" y="35" width="335" height="145" rx="3" className="docs-diag-box" />
        <text x="415" y="65" className="docs-diag-label">CONTROLLED EXTERNAL CALLS</text>
        <text x="415" y="90" className="docs-diag-mono">↗ Locate Tool: Public Geo API (free)</text>
        <text x="415" y="115" className="docs-diag-mono">↗ Benchmark Tool: speed.cloudflare.com</text>
        <text x="415" y="140" className="docs-diag-mono">↗ Leaflet Map: OpenStreetMap tiles</text>
        <text x="415" y="162" className="docs-diag-sub">Initiated only upon explicit user trigger</text>
      </svg>
    </div>
  );
}
