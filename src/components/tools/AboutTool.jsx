import React from "react";
import {
  BookOpen,
  GithubLogo,
  Lightbulb,
  ListBullets,
  LockKey,
  Stack,
  TreeStructure,
} from "@phosphor-icons/react";
import { ResultBox } from "../ui/ResultBox";

export function AboutTool() {
  return (
    <div className="flex flex-col gap-5">
      <ResultBox
        icon={<Lightbulb size={16} weight="bold" />}
        title="About the project"
      >
        <p className="text-sm leading-relaxed text-(--muted)">
          <strong className="text-(--ink)">SpeedBench</strong> is a modern,
          modular rebuild of <strong className="text-(--ink)">Netbench</strong>{" "}
          — an offline IPv4 networking calculator — extended with a long-run
          internet quality benchmark. It ships as a static Cloudflare Pages app
          and keeps every network calculation inside your browser.
        </p>
        <p className="toolkit-result-note">
          Built for quick diagnostics: subnet math on the spot, then a longer
          speed-stability test whenever you need it.
        </p>
      </ResultBox>

      <ResultBox
        icon={<BookOpen size={16} weight="bold" />}
        title="Credits & attribution"
      >
        <p className="text-sm leading-relaxed text-(--muted)">
          This project is built upon the original{" "}
          <a
            href="https://netbench.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-(--accent) underline underline-offset-2 hover:opacity-80"
          >
            Netbench (netbench.pages.dev)
          </a>
          . The original IPv4 logic, the offline-first calculator concept, and
          the overall idea are fully credited to the Netbench author. SpeedBench
          re-expresses that work as a modular React + Vite codebase and adds a
          new long-run benchmark tool, an interactive Leaflet map, and a
          refreshed interface.
        </p>
        <div className="toolkit-facts">
          <p className="font-mono text-xs text-(--muted)">
            Original Source:{" "}
            <span className="text-(--ink)">https://netbench.pages.dev</span>
          </p>
          <p className="font-mono text-xs text-(--muted)">
            Original App:{" "}
            <span className="text-(--ink)">
              Netbench — Offline IPv4 networking calculator
            </span>
          </p>
        </div>
      </ResultBox>

      <ResultBox
        icon={<ListBullets size={16} weight="bold" />}
        title="What's inside"
      >
        <ul className="toolkit-list text-sm text-(--muted)">
          <li>
            <strong className="text-(--ink)">Offline IP toolkit:</strong> subnet
            breakdown, CIDR membership, mask conversion, dual-stack address
            classification (IPv4 &amp; IPv6), and parent-CIDR splitting — all
            computed with bitwise math, even without a connection.
          </li>
          <li>
            <strong className="text-(--ink)">Long-run benchmark:</strong> 4
            parallel download streams sample throughput, loaded ping, jitter,
            and probe loss once per second; burst vs sustained analysis flags
            step-downs over time.
          </li>
          <li>
            <strong className="text-(--ink)">Interval mode & data cap:</strong>{" "}
            run continuously, or cycle 10 s measuring / 20 s resting to save
            data, with an optional byte-counted cap that stops the session
            automatically.
          </li>
          <li>
            <strong className="text-(--ink)">Session recovery & export:</strong>{" "}
            the last session can be restored from local storage, and results
            export to CSV or JSON.
          </li>
          <li>
            <strong className="text-(--ink)">Locate:</strong> look up any public
            IP on an interactive Leaflet map using free geolocation providers —
            city, region, postal code, time zone, ISP, and ASN, no API key
            required.
          </li>
        </ul>
      </ResultBox>

      <ResultBox
        icon={<LockKey size={16} weight="bold" />}
        title="Privacy first"
      >
        <ul className="toolkit-list text-sm text-(--muted)">
          <li>
            All IPv4 math runs 100% offline in your browser — nothing is sent to
            a server.
          </li>
          <li>
            Only three features touch the network:{" "}
            <strong className="text-(--ink)">Locate</strong> (public geolocation
            APIs), <strong className="text-(--ink)">Benchmark</strong>{" "}
            (Cloudflare's public speed endpoint), and{" "}
            <strong className="text-(--ink)">IP info</strong>'s geo panel for
            public addresses. Everything else stays local.
          </li>
          <li>
            No telemetry, no analytics, no trackers, no background requests
            beyond the tools you open.
          </li>
          <li>
            Benchmark sessions are stored only in your browser's localStorage
            for recovery and export.
          </li>
        </ul>
      </ResultBox>

      <ResultBox
        icon={<TreeStructure size={16} weight="bold" />}
        title="How it's built"
      >
        <ul className="toolkit-list text-sm text-(--muted)">
          <li>
            <strong className="text-(--ink)">Local modular:</strong> the source
            is split into focused files (ideally under 250 lines each) covering
            IP math, geo lookups, the benchmark engine, and isolated UI
            components.
          </li>
          <li>
            <strong className="text-(--ink)">Production monolith:</strong> Vite
            bundles the whole app into a single{" "}
            <code className="font-mono">app.js</code> file, so the browser loads
            one script and one stylesheet.
          </li>
          <li>
            <strong className="text-(--ink)">Cloudflare Pages:</strong> the site
            is deployed with built-in Pages Functions (
            <code className="font-mono">functions/api/info.js</code>,{" "}
            <code className="font-mono">functions/speed/*</code>) that can serve
            self-hosted endpoints alongside the public ones.
          </li>
        </ul>
      </ResultBox>

      <ResultBox icon={<Stack size={16} weight="bold" />} title="Tech stack">
        <div className="toolkit-chips">
          <span>React 19</span>
          <span>Vite 6</span>
          <span>Framer Motion</span>
          <span>Phosphor Icons</span>
          <span>Leaflet + CARTO</span>
          <span>Cloudflare Pages</span>
        </div>
        <p className="toolkit-result-note">
          The map uses raster tiles provided by CARTO on top of OpenStreetMap
          data, loaded only when the Locate tool is opened.
        </p>
      </ResultBox>

      <ResultBox
        icon={<GithubLogo size={16} weight="bold" />}
        title="Links & references"
      >
        <div className="toolkit-chips">
          <a
            href="https://netbench.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="toolkit-chip"
          >
            Original Site: netbench.pages.dev ↗
          </a>
          <a
            href="https://github.com/sparkplugx1904/speedbench"
            target="_blank"
            rel="noopener noreferrer"
            className="toolkit-chip"
          >
            GitHub Repository ↗
          </a>
        </div>
        <p className="toolkit-result-note">
          SpeedBench is a work in progress — feedback and issue reports are
          welcome on the repository.
        </p>
      </ResultBox>
    </div>
  );
}
