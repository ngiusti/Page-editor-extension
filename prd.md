Product Requirements Document (PRD)

Product Name: On‑Page Visual Editor (AI)

Owner: Nicholas Giusti (PM/Tech Lead)Doc Status: Draft v0.1Last Updated: 2025‑08‑10 (America/Los_Angeles)

1) One‑liner

A Chrome MV3 extension that lets you visually edit any webpage in‑place (text, styles, attributes), manage reusable style presets, and ask an AI to make targeted changes via a safe JSON "edit plan"—with preview/diff and undo.

2) Problem Statement & Goals

Problem: Designers, marketers, and PMs often need quick visual edits for mockups, reviews, or AB test planning, but switching between DevTools, design tools, and CMS is slow and technical.

Primary Goals

One‑click visual editing of text, styles, and attributes directly on the page.

Reusable presets (colors, type scale, radii, spacing) synced to the user’s Chrome account.

AI “edit by instruction” with predictable, reviewable JSON plans and safe application.

Preview/diff & undo/redo to make changes reversible and transparent.

Export resulting CSS/tokens for handoff to code or design systems.

Non‑Goals (v1)

Full DOM refactor or heavy layout tooling (e.g., grid editors, complex reflows).

Cross‑site publishing back to a CMS (headless CMS integrations can come later).

Persistent site‑wide autoloading of edits beyond the current session (we allow export; v2 may add opt‑in reapply rules).

3) Target Users & Personas

Designer Dana – wants quick color/typography tweaks and screenshots for stakeholders.

PM Priya – validates hypotheses (“bigger CTA, brand color”) without touching code.

Dev Devin – prototypes UI variants and exports clean CSS to commit afterwards.

QA Quinn – adjusts copy/styles to reproduce visual bugs and document diffs.

4) Use Cases

Quick copy edit: Inline change of headings and CTAs.

Visual restyle: Select an element → change color/type/spacing → preview before applying.

Apply preset: Choose "Brand A" preset → brand tokens populate CSS variables.

AI request: “Make primary buttons brand color, 12px radius, bold labels” → model returns JSON edit plan → user previews diff → applies.

Export handoff: Copy generated CSS and/or JSON plan for dev handoff.

Accessibility touch‑up: Add alt text, increase contrast, bump font size.

5) Functional Requirements

5.1 Visual Editing

Inline text editing (contenteditable) for headings, paragraphs, buttons, links.

Style editing via property panel: color, background, font family/size/weight/line height, spacing (margin/padding), border, radius, shadow, display (limited), width/height (limited), opacity.

Attribute editing: alt, title, aria-label, target, rel (safe list only).

Element actions: hide/show, remove (soft remove with undo), duplicate (optional v1.1).

CSS injection: insert a <style> tag with generated selectors or CSS variables.

5.2 Element Targeting & Selection

Hover/inspect overlay with highlight box and breadcrumb path (html > body > ...).

Unique selector generation (combo of id, classes, nth-of-type) with fallback.

Multi‑select by CSS selector input; element picker tool.

Shadow DOM & iframe handling: best‑effort support with explicit prompts and scoped editing per root (v1: warn or disable where not permitted).

5.3 Presets & Profiles

Presets contain reusable tokens: colors, type scale, radii, spacing, shadows, fonts.

Profiles tie presets to domains/paths with optional auto‑apply rules (v1 manual apply; v1.1 optional reapply per site).

CRUD for presets/profiles; import/export JSON.

Storage: chrome.storage.sync for small data & names; IndexedDB/local for larger.

5.4 AI Integration

Side‑panel chat: user instruction → JSON "edit plan" only (strict schema).

Page map sent to model: compact list of visible targetable nodes (max ~300), tokens, and constraints (no JS exec, no remote fetch, selectors must exist in map).

Dry‑run diff: list selectors & changes; user must click Apply.

Guardrails: refuse ops outside allowlist; reject large/unsafe outputs; token budget caps.

Model agnostic: OpenAI/Anthropic/local (configurable endpoint + key).

5.5 History, Diff, and Undo

Local, tab‑scoped history stack (max 50 steps).

Diff viewer per plan (before/after property values, changed selectors count).

Revert all changes in session.

5.6 Export

Export CSS (scoped selectors) and tokens (CSS variables).

Export JSON edit plan(s) and history for reproducibility.

5.7 Options & Permissions

Options page: API key, model/provider, presets management, privacy settings, hotkeys.

Permissions: activeTab, scripting, storage, sidePanel; host_permissions: ["<all_urls>"].

6) Non‑Functional Requirements

Performance: apply plan ≤ 150ms for ≤ 100 elements; selector matching cached.

Footprint: keep injected CSS under 100KB; memory use < 100MB.

Reliability: MutationObserver to reapply inline styles if SPA rerenders; rate‑limit.

Privacy: minimize page content sent to AI; never send full HTML unless user opts in.

Compatibility: Chrome (primary), Edge (Chromium) as stretch; MV3 compliant.

Accessibility: fully keyboard navigable; maintain focus; WCAG color contrast helper.

Localization: English v1; extensible copy file for future locales.

7) Data Model (Schemas)

7.1 Preset

{
  "id": "uuid",
  "name": "Brand A",
  "version": 1,
  "tokens": {
    "color": {"brand": "#FD0808", "accent": "#3E7CB1", "text": "#232425"},
    "type": {"basePx": 18, "scale": 1.25, "headingFont": "Inter, system-ui"},
    "radius": {"sm": 4, "md": 8, "lg": 12},
    "spacing": {"sm": 4, "md": 8, "lg": 16},
    "shadow": {"sm": "0 1px 2px rgba(0,0,0,.1)"}
  },
  "domainRules": [
    {"match": "example.com/*", "autoApply": false}
  ],
  "createdAt": 1690000000, "updatedAt": 1690000000,
  "isDefault": true
}

7.2 Site Profile

{
  "domain": "example.com",
  "presetId": "uuid",
  "customCss": "body{--brand:#FD0808}",
  "notes": "Marketing site v2",
  "updatedAt": 1690000000
}

7.3 Page Map (model input)

{
  "nodes": [
    {"key":"n0","tag":"button","css":".cta.primary","text":"Buy Now","aria":"","role":""},
    {"key":"n1","tag":"h2","css":".hero h2","text":"Acme Platform","aria":"","role":""}
  ],
  "tokens": {"brand":"#FD0808","fontBase":"18px","radius":"12px"}
}

7.4 Edit Plan (model output)

{
  "ops": [
    {"action":"style","selector":".cta.primary","styles":{"backgroundColor":"var(--brand)","borderRadius":"12px","fontWeight":"700"}},
    {"action":"text","selector":".hero h2","text":"Level up with Acme"},
    {"action":"attr","selector":"img.hero","name":"alt","value":"Acme product hero"},
    {"action":"insert_css","css":":root{--brand:#FD0808}"}
  ],
  "notes":"Apply brand color and radius to primaries; tighten hero copy."
}

8) Architecture

MV3 Components

Content script: selection overlay, page map builder, edit applier, history stack.

Background service worker: model requests, rate limiting, API key storage, chunking.

Side Panel / Popup UI: tabs for Inspect · Styles · Presets · AI · History.

Options page: provider settings, presets CRUD, import/export.

Offscreen document (optional): heavy parsing or diff rendering without blocking.

Message Flow

UI → Content: GET_MAP → compact map (≤300 nodes).

UI → Background: ASK_AI with request + tokens + map.

Background → AI Provider: prompt → JSON edit plan.

Background → UI: plan returned.

UI → Content: APPLY_PLAN → apply, record history, show diff.

Storage Strategy

chrome.storage.sync: preset indices, small token sets, profile rules (watch quotas).

chrome.storage.local + IndexedDB: large CSS, history, cached edit plans.

API key in storage.local (warn it’s not encrypted; optional OS keychain via native host later).

9) Security, Privacy, & Guardrails

Allowlist actions: style, text, attr, insert_css only. No script injection.

Selector confinement: only selectors present in page_map are permitted.

Content minimization: send only short text snippets; redact tokens that look like secrets.

Domain controls: optional allowlist; per‑domain toggle; quick panic “Disable on this site”.

CSP/IPCs: handle sites with strict CSP by favoring inline style changes/<style> insert.

Telemetry: off by default; if enabled, event counts only (no page content).

10) UX Overview & Key Screens

Side Panel with tabs:

Inspect: element picker, breadcrumb, quick actions (Hide/Show, Duplicate, Remove).

Styles: property groups, unit inputs, token pickers, contrast checker.

Presets: select/apply, edit tokens, import/export.

AI: chat box, last plan preview, Apply/Discard, slider for scope (few/many elements).

History: list of applied ops; Undo/Redo; Revert All.

Overlays: hover highlight; selected outline; popover with quick style fields.

Diff View: table by selector/property (before → after), count of impacted nodes.

11) Acceptance Criteria (MVP)

Can select an element and change color, font size, and border radius via UI.

Can create a preset, save to sync, re‑load it on another machine.

Can issue an AI instruction and receive a valid JSON plan that passes schema validation.

Can preview a diff and apply/revert the plan without errors.

Can export CSS and tokens; export/import preset JSON.

12) Milestones & Rough Scope

M0 – Scaffolding (1–2 days): Manifest, side panel, content script bridge, basic UI.

M1 – Visual Edit (3–5 days): Inspector overlay, core style panel, attribute edits.

M2 – Presets & Sync (2–3 days): Token model, CRUD, sync+local storage, import/export.

M3 – AI Plan (4–6 days): Page map, prompt templates, provider adapter, JSON schema validation, dry‑run diff.

M4 – History & Diff (2–3 days): Undo/redo stack, diff table, revert all.

M5 – Export & Polish (2–3 days): CSS/token export, hotkeys, error toasts, docs.

M6 – QA & Publish (2–4 days): CSP tests, SPA robustness, store listing assets.

13) Risks & Mitigations

AI unpredictability → Strict schema, function‑calling/JSON mode, output size caps.

SPA re‑renders wipe inline styles → MutationObserver reapply + <style> injection preferred.

Storage quotas → Store indices in sync, bulk in local/IndexedDB; chunk large entries.

CSP/iframes/shadow DOM → Graceful degradation; per‑root scoping; user warnings.

Performance regressions → Batch style updates; requestAnimationFrame; selector caching.

Privacy concerns → Content minimization; domain allowlist; no telemetry by default.

14) Open Questions

Support Tailwind class editing/detection in v1 or later?

Team sharing of presets (sync via file share vs. optional cloud backend)?

Multiple model providers per site (fallback/round‑robin)?

Persisted reapply rules per domain (v1.1)?

Site screenshots export flow (PNG/WebP) from side panel?

15) Success Metrics

≥70% of AI plans applied without manual correction (post‑M3).

Median time from instruction → applied diff < 10s.

≥3 presets created per active user within first week.

DAU/WAU retention ≥ 35% after week 2.

16) Glossary

Page Map: Compact, privacy‑aware list of targetable nodes the AI can reference.

Edit Plan: Strict JSON describing allowed operations to apply to the page.

Preset: Named set of reusable design tokens (colors/type/radii/spacing/shadows).

Profile: Domain/path rule that binds a preset and optional custom CSS.