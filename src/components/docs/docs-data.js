export const DOC_SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    eyebrow: "GUIDES / OVERVIEW",
    category: "Getting Started",
    desc: "SpeedBench is an offline-first IPv4 network calculator and long-run internet quality benchmark instrument.",
    glance: [
      { label: "Core Engine", value: "Offline Bitwise JS" },
      { label: "Benchmark Endpoint", value: "speed.cloudflare.com" },
      { label: "Architecture", value: "React 19 + Single Bundle" },
      { label: "Privacy", value: "Zero Telemetry / Offline First" },
    ],
    diagram: "architecture",
    content: [
      {
        heading: "Introduction",
        body: `SpeedBench is a modern, modular rebuild of the original Netbench calculator, extended with a high-precision, long-run internet quality benchmark tool. It runs directly inside your web browser as a static application on Cloudflare Pages.
        
All network calculations—including CIDR subnetting, wildcard masks, IP range calculation, and binary formatting—are computed 100% on the client side using JavaScript 32-bit bitwise operations. No data is sent to external servers for calculations.`,
      },
      {
        heading: "Core Capabilities",
        list: [
          "Long-run Quality Benchmark: Sustained throughput measurement, loaded latency probes, probe loss detection, bufferbloat diagnostics, and automatic session saving.",
          "Subnet Calculator: Full IPv4 network, broadcast, wildcard mask, and usable host range calculations.",
          "Membership Tester: Instant verification of whether an IP address belongs to a specified CIDR block.",
          "Mask Converter: Seamless conversion between prefix lengths (/0 to /32), dotted decimal masks, and required host counts.",
          "IP Info & Classifier: Deep classification of IPv4 & IPv6 addresses into RFC categories (Private, CGNAT, Loopback, Link-Local, Multicast, etc.).",
          "Subnet Splitter: Equal partitioning of parent CIDRs into child subnets with hierarchical visual mapping.",
          "Locate Tool: Client IP geolocation lookup on an interactive Leaflet map using free, privacy-conscious public APIs.",
        ],
      },
    ],
  },
  {
    id: "quick-start",
    title: "Quick Start",
    eyebrow: "GUIDES / QUICK START",
    category: "Getting Started",
    desc: "Get started with SpeedBench diagnostics in less than 30 seconds.",
    glance: [
      { label: "Setup Required", value: "None (Zero Install)" },
      { label: "Run Locally", value: "python serve.py" },
      { label: "Supported Browsers", value: "Chrome, Edge, Firefox, Safari" },
      { label: "URL Parameters", value: "?tool=<id>" },
    ],
    content: [
      {
        heading: "1. Running an Internet Quality Benchmark",
        body: `Navigate to the Benchmark tool directly from the sidebar or via URL parameter \`?tool=benchmark\`.
        
1. Select your **Measurement Mode**: choose **Continuous** for nonstop bufferbloat analysis or **Interval** (10s run / 20s rest) for metered bandwidth connections.
2. Set a **Data Cap** (e.g., 500 MB, 1 GB, 5 GB) if you want the test to automatically stop once a threshold is reached.
3. Click **Start Benchmark**. Keep the browser tab visible for continuous sampling.
4. View live throughput (Mbps), loaded ping, probe jitter, and packet loss in real time.
5. Export a detailed JSON session summary at any time for ISP reports.`,
      },
      {
        heading: "2. Calculating IPv4 Subnets",
        body: `Switch to the Subnet tool (\`?tool=subnet\`) to calculate network masks and host boundaries:
        
1. Enter any IPv4 address (e.g. \`192.168.1.130\`).
2. Select or enter a CIDR prefix (e.g. \`/26\`) or dotted decimal mask (\`255.255.255.192\`).
3. Results update instantaneously without pressing submit. Copy addresses with a single click.`,
      },
      {
        heading: "3. Direct Tool Deep-Linking",
        body: "Every tool in SpeedBench supports direct URL linking for instant access and bookmarking:",
        list: [
          "?tool=benchmark - Internet Quality Benchmark",
          "?tool=subnet - IPv4 Subnet Calculator",
          "?tool=member - CIDR Membership Verifier",
          "?tool=mask - Mask & Host Count Converter",
          "?tool=info - IP Classification & Binary Inspector",
          "?tool=split - Subnet Partitioning & Splitting",
          "?tool=locate - Public IP Geo Lookup & Map",
          "?tool=docs - Comprehensive Documentation",
          "?tool=about - Project Attribution & Acknowledgments",
        ],
      },
    ],
  },
  {
    id: "benchmark",
    title: "Benchmark Guide",
    eyebrow: "TOOLS / BENCHMARK",
    category: "Deep Dives",
    desc: "Understand how SpeedBench measures sustained throughput, loaded latency, and bufferbloat.",
    glance: [
      { label: "Parallel Streams", value: "4x HTTP Fetch Streams" },
      { label: "Probe Frequency", value: "4 probes / second" },
      { label: "Latency Type", value: "Loaded (Working) Latency" },
      { label: "WakeLock", value: "Screen Keep-Alive Supported" },
    ],
    diagram: "benchmark",
    content: [
      {
        heading: "How SpeedBench Measures Internet Quality",
        body: `Unlike traditional one-shot speed tests that run for only 10–15 seconds and measure theoretical peak burst, SpeedBench is engineered as an **endurance test instrument**. It determines whether your connection holds stability over extended periods under real-world multi-stream load.
        
SpeedBench runs **four concurrent download streams** fetching chunked payloads from Cloudflare's global edge network. As bytes stream in, high-resolution performance timers measure true sustained throughput.`,
      },
      {
        heading: "Loaded Latency & Bufferbloat Detection",
        body: `When network buffers in routers or modems become excessively congested, latency spikes drastically—a phenomenon known as **bufferbloat**.
        
SpeedBench continuously sends **4 lightweight HTTP probes per second** alongside the active download load:
- **Idle Ping vs Loaded Ping:** Compare baseline round-trip time against loaded RTT. A sharp increase indicates inadequate queue management (e.g., lack of SQM/CAKE).
- **Jitter:** The mean absolute deviation between consecutive probe delays.
- **Probe Loss:** The percentage of HTTP probes that fail or exceed the 2.0-second timeout window across rolling sample windows.`,
      },
      {
        heading: "Continuous vs Interval Modes",
        list: [
          "Continuous Mode: Continuous load for in-depth quality benchmarking. At 50 Mbps, approximately 22 GB is transferred per hour. Ideal for testing uncapped fiber/broadband stability.",
          "Interval Mode: 10 seconds active download followed by 20 seconds rest. Keeps bandwidth usage modest while still catching connection step-downs over hours or days.",
        ],
      },
      {
        heading: "Automatic State Recovery & Session Persistence",
        body: "Test metrics and recent samples are automatically preserved in your browser's `localStorage`. If you accidentally refresh the page, you can resume viewing the latest session data without data loss.",
      },
    ],
  },
  {
    id: "subnetting",
    title: "Subnetting & CIDR Math",
    eyebrow: "TOOLS / SUBNETTING",
    category: "Deep Dives",
    desc: "Mathematical principles behind bitwise IPv4 subnetting and special prefix rules.",
    glance: [
      { label: "Address Space", value: "32-bit Integer (0 to 2^32-1)" },
      { label: "Math Engine", value: "JavaScript Bitwise (>>> 0)" },
      { label: "RFC 3021", value: "/31 2-host point-to-point" },
      { label: "RFC 3021 /32", value: "Single Host Route" },
    ],
    diagram: "subnet",
    content: [
      {
        heading: "The 32-Bit Bitwise Foundation",
        body: `Every IPv4 address consists of 32 binary bits divided into four 8-bit octets.
        
In SpeedBench, all arithmetic operations convert decimal octets into an unsigned 32-bit integer:
\`\`\`js
// Convert dotted quad to 32-bit uint
const ipInt = ((o1 << 24) | (o2 << 16) | (o3 << 8) | o4) >>> 0;

// Derive netmask from prefix length
const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;

// Network and broadcast calculations
const networkInt = (ipInt & maskInt) >>> 0;
const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
\`\`\`
Because operations run with the unsigned right-shift operator (\`>>> 0\`), JavaScript handles 32-bit unsigned integers without floating-point inaccuracies.`,
      },
      {
        heading: "Special Prefixes: RFC 3021 (/31) and /32",
        body: `Standard subnets (/0 to /30) reserve the first address for the Network identifier and the last address for the Broadcast identifier, giving \`2^(32 - prefix) - 2\` usable host addresses.
        
However, modern networking adheres to special RFC standards:
- **RFC 3021 (/31 Prefixes):** Designed for point-to-point router links. Both addresses are usable as host endpoints; no broadcast address is reserved.
- **/32 Prefixes:** Represents a single host route (loopback or host routing). Host count is exactly 1.`,
      },
    ],
  },
  {
    id: "locate",
    title: "Locate & Geo Lookup",
    eyebrow: "TOOLS / LOCATE",
    category: "Diagnostics",
    desc: "Map your public IP, ASN, ISP details, and geographical coordinates.",
    glance: [
      { label: "Map Engine", value: "Leaflet 1.9 + OpenStreetMap" },
      { label: "API Provider", value: "Public Geo APIs (ipapi.co)" },
      { label: "API Key", value: "None Required" },
      { label: "Data Shared", value: "Queried IP only" },
    ],
    content: [
      {
        heading: "Public IP Geolocation",
        body: `The Locate tool allows you to inspect your own public IP or look up any valid public IPv4/IPv6 address.
        
Information provided includes:
- **City, Region, and Country**
- **Latitude and Longitude** rendered with an interactive Leaflet pinpoint marker
- **Autonomous System (AS Number & AS Organization)**
- **ISP and Organization Name**
- **Carrier-Grade NAT (CGNAT) Hint:** Alerts you if your ISP is using shared RFC 6598 address blocks (100.64.0.0/10).`,
      },
      {
        heading: "Zero Leakage for Offline Tools",
        body: "Unlike other calculator websites that track your location on every page load, SpeedBench initiates geo lookup network requests ONLY when you open the Locate tool or click the IP map widget.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Data Boundary",
    eyebrow: "POLICIES / PRIVACY",
    category: "Reference",
    desc: "Our commitment to client privacy, zero tracking, and offline data boundaries.",
    glance: [
      { label: "User Tracking", value: "Zero (No GA, No Pixels)" },
      { label: "Calculation Privacy", value: "100% In-Browser" },
      { label: "Data Storage", value: "Local Device Only" },
      { label: "Open Source", value: "Yes (MIT License)" },
    ],
    diagram: "privacy",
    content: [
      {
        heading: "Strict Offline Principle",
        body: `SpeedBench is built with privacy as a foundational architecture requirement:
        
1. **No Analytics or Telemetry:** No Google Analytics, no Facebook pixels, no fingerprinting scripts, and no background session recorders.
2. **Local Execution:** Subnet, membership, mask, split, and IP classification logic runs entirely within your browser's JavaScript sandbox.
3. **Session Persistence:** Benchmark test history and settings are stored locally in \`window.localStorage\` under the key \`speedbench_session\`. No session logs are ever uploaded to a backend server.`,
      },
      {
        heading: "External Network Endpoints",
        body: `External network requests occur strictly within two tools:
- **Benchmark Tool:** Downloads static dummy payload bytes from Cloudflare's public test server (\`https://speed.cloudflare.com/__down\`) to measure network throughput.
- **Locate Tool:** Performs a query to free public geolocation APIs to retrieve coordinates for mapping.`,
      },
    ],
  },
  {
    id: "faq",
    title: "Troubleshooting & FAQ",
    eyebrow: "REFERENCE / FAQ",
    category: "Reference",
    desc: "Answers to common questions about network tests, calculations, and browser limits.",
    glance: [
      { label: "Support", value: "GitHub Community" },
      { label: "Export Format", value: "Standard JSON" },
      { label: "License", value: "MIT License" },
      { label: "Original Concept", value: "netbench.pages.dev" },
    ],
    content: [
      {
        heading: "Why does ping increase significantly during the benchmark?",
        body: "A rise in latency during download bursts is expected and indicates loaded latency. If the ping increases from 15ms to 150ms+, your router likely suffers from bufferbloat (packet queue delays). Enabling Smart Queue Management (SQM) on your router can mitigate this.",
      },
      {
        heading: "Why does /31 show 2 usable hosts instead of 0?",
        body: "SpeedBench follows RFC 3021 ('Using 31-Bit Prefixes on IPv4 Point-to-Point Links'). In modern routing (BGP peers, router interconnects), /31 subnets permit two usable host addresses without wasting network and broadcast identifiers.",
      },
      {
        heading: "How can I host SpeedBench offline on my own computer?",
        body: "SpeedBench includes a built-in Python server script `serve.py`. Simply clone the repository, build with `npm run build`, and run `python serve.py --port 4173` to run SpeedBench 100% locally on localhost.",
      },
    ],
  },
];
