import React, { useState, useEffect } from "react";
import { DOC_SECTIONS } from "../docs/docs-data";
import {
  ArchitectureDiagram,
  BenchmarkFlowDiagram,
  SubnetBitwiseDiagram,
  PrivacyBoundaryDiagram,
} from "../docs/DocsDiagrams";
import "../../styles/docs.css";

export function DocsTool() {
  const [activeId, setActiveId] = useState(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("doc");
      if (DOC_SECTIONS.some((s) => s.id === param)) return param;
    } catch {}
    return "overview";
  });

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("doc", activeId);
      window.history.replaceState({}, "", url);
    } catch {}
  }, [activeId]);

  const activeDoc = DOC_SECTIONS.find((s) => s.id === activeId) || DOC_SECTIONS[0];

  // Group sections by category
  const categories = Array.from(new Set(DOC_SECTIONS.map((s) => s.category)));

  return (
    <div className="docs-wrapper">
      {/* Mobile section dropdown */}
      <div className="docs-mobile-nav lg:hidden">
        <label htmlFor="docs-section-select">Select Topic</label>
        <select
          id="docs-section-select"
          className="docs-mobile-select"
          value={activeId}
          onChange={(e) => setActiveId(e.target.value)}
        >
          {DOC_SECTIONS.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.category}: {sec.title}
            </option>
          ))}
        </select>
      </div>

      <div className="docs-layout">
        {/* Left Desktop Sidebar with Button List */}
        <aside className="docs-sidebar hidden lg:flex" aria-label="Documentation Navigation">
          <nav className="docs-sidebar-nav">
            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <div className="docs-sidebar-category">{cat}</div>
                {DOC_SECTIONS.filter((s) => s.category === cat).map((sec) => {
                  const isActive = sec.id === activeId;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveId(sec.id)}
                      aria-current={isActive ? "page" : undefined}
                      className="docs-nav-button"
                    >
                      <span>{sec.title}</span>
                      {isActive && <span aria-hidden="true">→</span>}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </nav>
        </aside>

        {/* Right Article Content */}
        <main className="docs-main">
          <article className="docs-article">
            <header className="docs-article-header">
              <span className="docs-article-eyebrow">{activeDoc.eyebrow}</span>
              <h1 className="docs-article-title">{activeDoc.title}</h1>
              <p className="docs-article-desc">{activeDoc.desc}</p>
            </header>

            {/* Quick Glance Key Facts Grid */}
            {activeDoc.glance && (
              <div className="docs-glance-grid">
                {activeDoc.glance.map((item, idx) => (
                  <div key={idx} className="docs-glance-item">
                    <span className="docs-glance-label">{item.label}</span>
                    <span className="docs-glance-val">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Visual Diagrams / Ilustrasi */}
            {activeDoc.diagram === "architecture" && <ArchitectureDiagram />}
            {activeDoc.diagram === "benchmark" && <BenchmarkFlowDiagram />}
            {activeDoc.diagram === "subnet" && <SubnetBitwiseDiagram />}
            {activeDoc.diagram === "privacy" && <PrivacyBoundaryDiagram />}

            {/* Detailed Content Sections */}
            {activeDoc.content.map((block, idx) => (
              <section key={idx} className="docs-section">
                <h2 className="docs-section-h2">{block.heading}</h2>
                {block.body && <p className="docs-body">{block.body}</p>}
                {block.list && (
                  <ul className="docs-list">
                    {block.list.map((li, lIdx) => (
                      <li key={lIdx}>{li}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </main>
      </div>
    </div>
  );
}
