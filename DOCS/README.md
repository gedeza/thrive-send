# 📚 ThriveSend Documentation Index

Welcome to the `DOCS` directory. Here you'll find all critical documentation, organized for discoverability, onboarding, compliance, and future maintainability.

---

## 🗂️ Documentation Structure

- [canonicals/](./canonicals/) — Product requirements, project rules, MVP spec
  - [PRD.md](./canonicals/PRD.md) — Product Requirements Document (single source of project truth)
  - [README.md](./canonicals/README.md) — Canonical onboarding and project intro
  - [MVP_Specification.md](./canonicals/MVP_Specification.md) — Minimum Viable Product scope

- [design-system/](./design-system/) — Colors, UI design audits, visual consistency checklists
  - [colour_scheme.md](./design-system/colour_scheme.md) — Central color and token reference
  - [color_scheme_compliance_audit.md](./design-system/color_scheme_compliance_audit.md) — Audit log for color usage
  - [color-usage-quick-guide.md](./design-system/color-usage-quick-guide.md)
  - [color-audit-report.md](./design-system/color-audit-report.md)
  - [color-docs-revision-checklist.md](./design-system/color-docs-revision-checklist.md)
  - [color-reference.md](./design-system/color-reference.md)
  - [color-audit-advanced-findings.md](./design-system/color-audit-advanced-findings.md)
  - [eslint-color-token-enforcement.md](./design-system/eslint-color-token-enforcement.md) — Lint rule details
  - [visual-consistency-checklist.md](./design-system/visual-consistency-checklist.md) — UI consistency verification

- [planning/](./planning/) — Implementation plans, resets, milestone docs
  - [implementation-plan.md](./planning/implementation-plan.md)
  - [implementation-plan-update.md](./planning/implementation-plan-update.md)
  - [remaining-implementation-tasks.md](./planning/remaining-implementation-tasks.md)
  - [demo-page-consolidation-plan.md](./planning/demo-page-consolidation-plan.md)
  - [project-reset-plan.md](./planning/project-reset-plan.md)

- [progress/](./progress/) — Status dashboards and change tracking  
  - [progress-snapshot.md](./progress/progress-snapshot.md) — Live milestone/project status
  - [project-progress.md](./progress/project-progress.md)
  - [project-progress-update.md](./progress/project-progress-update.md)

- [architecture/](./architecture/) — Deep dives on system, UI, and component patterns
  - [component-architecture.md](./architecture/component-architecture.md)
  - [ui-components.md](./architecture/ui-components.md)
  - [ui-components-integration.md](./architecture/ui-components-integration.md)
  - [ui-consistency-guide.md](./architecture/ui-consistency-guide.md)
  - [theme-integration-guide.md](./architecture/theme-integration-guide.md)

- [guides/](./guides/) — Setup, workflow, integration, best practice tutorials
  - [clerk-setup-guide.md](./guides/clerk-setup-guide.md) — **Primary reference for authentication setup (Clerk)**
  - [git-workflow.md](./guides/git-workflow.md)
  - [authentication-alternatives.md](./guides/authentication-alternatives.md)
  - [SETUP_STORYBOOK.md](./guides/SETUP_STORYBOOK.md)

- [automation/](./automation/) — Scripts and docs for doc/task compliance
  - [doc_implementation_alignment_process.md](./automation/doc_implementation_alignment_process.md)
  - [task_doc_reconciliation.json](./automation/task_doc_reconciliation.json)
  - [task_review_automation.py](./automation/task_review_automation.py)

- [management/](./management/) — Project and client management policy/docs
  - [client-management-plan.md](./management/client-management-plan.md)

- [checklists/](./checklists/) — Non-UI process and QA checklists

- [archive/](./archive/) — Deprecated/legacy/draft or merged docs (move outdated content here for clarity)

- [project-development-rules.md](./project-development-rules.md) — The project's overarching ruleset (referenced in all major PRs).

---

## 🔗 Canonical Reference Docs

- [PRD](./canonicals/PRD.md) — Product requirements
- [README](./canonicals/README.md) — Onboarding/mission
- [MVP_Specification](./canonicals/MVP_Specification.md)
- [Project Development Rules](./project-development-rules.md)

---

## 📈 Current Project Status

See the latest status and what's complete, outstanding, or in progress:
- [progress-snapshot.md](./progress/progress-snapshot.md)

---

## 💡 How To Use This Directory

- Place new docs in the appropriate subdirectory.
- Update this index with any major documentation or structural changes.
- For high-level project context, see the repo root [README.md](../README.md).
- For authentication: **Follow [clerk-setup-guide.md](./guides/clerk-setup-guide.md) as the standard reference.**

---

### 🔄 **Recent Updates (2024-06)**

- Standardized on **Clerk authentication**, see `guides/clerk-setup-guide.md`.
- The **Visual Consistency Checklist** has been merged into the [design-system/](./design-system/visual-consistency-checklist.md) folder for unified design audit processes.
- Checklists folder now only contains non-UI or other process lists (if any).
- All progress and planning docs are in their respective folders.
- Any duplicate or legacy content has been archived for clarity.

---

_Last updated: 2024-06_
