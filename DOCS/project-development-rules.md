# ThriveSend Project Development Rules & Guidelines

> **Version:** 2024-06  
> **Maintainer:** {YOUR TEAM or CORE DEVS}  
> **Purpose:**  
> Codifies the discipline, break-through practices, and enforceable rules behind successful ThriveSend development.  
> Includes explicit cross-references to canonical docs, implementation guides, audits, and compliance tools.

---

## 1. Sources of Truth & Canonical Documents

- All product scope, features, flows, and requirements **must** be recorded in [`PRD.md`](PRD.md) and [`README.md`](README.md).  
  - *Any change must be reflected here first, before code or secondary docs are updated.*
- All contributors must review and propagate updates from these documents.
- All docs that overlay, supersede, or clarify product direction **must link back** to these files.

**Related Files:**  
- [`PRD.md`](PRD.md)
- [`README.md`](README.md)
- [`MVP_Specification.md`](MVP_Specification.md)

---

## 2. Implementation, Tasks, and Progress Tracking

- Every significant change or milestone must start with an [`implementation-plan.md`](implementation-plan.md) entry or update.
- *All implementation plans must track their actual status in `progress-snapshot.md`, `project-progress.md`, and updates must be reconciled using automation described in `doc_implementation_alignment_process.md`.*
- Task artifacts (e.g., `remaining-implementation-tasks.md`, `project-reset-plan.md`) are mandatory, and must not contradict canonical plans.

**Related Files:**  
- [`implementation-plan.md`](implementation-plan.md)  
- [`implementation-plan-update.md`](implementation-plan-update.md)  
- [`progress-snapshot.md`](progress-snapshot.md)  
- [`project-progress.md`](project-progress.md)  
- [`project-progress-update.md`](project-progress-update.md)  
- [`remaining-implementation-tasks.md`](remaining-implementation-tasks.md)  
- [`project-reset-plan.md`](project-reset-plan.md)  
- [`doc_implementation_alignment_process.md`](doc_implementation_alignment_process.md)  
- *Automation for tracking: [`task_doc_reconciliation.json`](task_doc_reconciliation.json), [`task_review_automation.py`](task_review_automation.py)*

---

## 3. Design Systems & Color Scheme Enforcement

- **Absolutely no ad hoc/wild color usage is allowed.**  
  - All colors are specified via semantic tokens and documented in [`colour_scheme.md`](colour_scheme.md).
  - **No** raw hex, css color names, or Tailwind default colors may be used in source or design files, see:  
    - [`eslint-color-token-enforcement.md`](eslint-color-token-enforcement.md)
    - [`color_scheme_compliance_audit.md`](color_scheme_compliance_audit.md)
    - [`color-usage-quick-guide.md`](color-usage-quick-guide.md)
- Color-related changes require audit/review and referencing compliance audit tools.

**Related Files:**  
- [`colour_scheme.md`](colour_scheme.md)
- [`color_scheme_compliance_audit.md`](color_scheme_compliance_audit.md)
- [`color-usage-quick-guide.md`](color-usage-quick-guide.md)
- [`color-reference.md`](color-reference.md)
- [`color-audit-report.md`](color-audit-report.md)
- [`color-audit-advanced-findings.md`](color-audit-advanced-findings.md)
- [`color-docs-revision-checklist.md`](color-docs-revision-checklist.md)
- [`eslint-color-token-enforcement.md`](eslint-color-token-enforcement.md)

---

## 4. Documentation Quality, Archival & Versioning

- Canonical and legacy docs **must** be clearly separated.  
  - *Consider moving outdated docs to `/archive` or `/legacy` or annotating them with `DEPRECATED`.*
- Every doc must have a paragraph describing its relation to the current canonical reference (`README.md`, `PRD.md`, etc) and indicate if it is authoritative or auxiliary.
- Avoid deleting old docs outright unless for legal/privacy reasons; instead, move or mark them as deprecated.

---

## 5. CI/CD, Linting & Coding Standards

- All contributors must run [ESLint](../eslint.config.mjs) and other code quality tools **pre-commit and before pushing**.
- Linting rules are strictly defined (see [`eslint-color-token-enforcement.md`](eslint-color-token-enforcement.md)).  
  - *All color-related lints MUST PASS for acceptance.*
- Guidelines for git and code workflows:
  - See [`git-workflow.md`](git-workflow.md)

---

## 6. Feature & Structural Organization

- **Group all features by domain and purpose.** Example:  
  - Docs on UI policy and component design live in `ui-components.md`, `component-architecture.md`, `ui-consistency-guide.md`, and `ui-components-integration.md`.
- Design and style guides are always in sync with referenced implementation plans.

**Related Files:**  
- [`component-architecture.md`](component-architecture.md)
- [`ui-components.md`](ui-components.md)
- [`ui-consistency-guide.md`](ui-consistency-guide.md)
- [`ui-components-integration.md`](ui-components-integration.md)
- [`theme-integration-guide.md`](theme-integration-guide.md)
- [`SETUP_STORYBOOK.md`](SETUP_STORYBOOK.md)
- [`demo-page-consolidation-plan.md`](demo-page-consolidation-plan.md)

---

## 7. Automation & Compliance Tools

- Task, doc, and color audits are performed using custom and standard scripts.
- Scripts, their usage, and update cadence are documented in the repo:
  - [`task_review_automation.py`](task_review_automation.py)
  - [`task_doc_reconciliation.json`](task_doc_reconciliation.json)
  - Audit outputs: [`color_scheme_compliance_audit.md`](color_scheme_compliance_audit.md)

---

## 8. Decision Logs & Retrospective Tracking

- Every major process or architectural decision (or deviation from plan/audit outcomes) is captured in a file (either listed in `project-progress-update.md` or a dedicated `decision-log.md` in the future).
- Retrospectives trigger updates to this rules doc.

---

## 9. General Best Practices & Reuse

- **Breakthroughs** like the color token policy, compliance audit loop, and documented implementation plans are reusable.  
- For any new project:
  - Duplicate these guideline docs for instant startup.
  - Adapt the color policy and audit scripts as required.
  - Maintain a clear distinction between design, process, and engineering rules.

---

## 10. Ongoing Documentation Analysis & Consolidation

- All documentation must undergo regular analysis against project changes, implementation plans, and actual progress.
- When new features, structural changes, or paradigm shifts are undertaken:
  1. Existing docs must be reviewed for relevance, accuracy, and potential overlap.
  2. Merges, consolidation, or clear deprecation must be executed (as with the visual consistency checklist: now unified under `/design-system/visual-consistency-checklist.md`).
  3. Every contributor is responsible for ensuring that their changes prompt this process, rather than accumulating obsolete or fragmented knowledge.
- Documentation status and consolidation reviews should be included as a checklist item on all major releases and retro/planning cycles.

---

## Appendix: Highly Recommended Reference Docs

| Area       | File                                                        | Notes                                             |
|------------|-------------------------------------------------------------|---------------------------------------------------|
| Color      | `colour_scheme.md`, `color_scheme_compliance_audit.md`      | Single source of truth for all color usage        |
| Product    | `PRD.md`, `MVP_Specification.md`                            | Canonical scope, onboarding for every new dev     |
| Implementation | `implementation-plan.md`, `progress-snapshot.md`        | Start/finish of feature and milestone tracking    |
| Automation | `task_review_automation.py`, `eslint-color-token-enforcement.md` | Custom and standard compliance tooling      |
| Workflow   | `git-workflow.md`                                           | Git, branch, and merge best practices            |
| Architecture| `component-architecture.md`, `ui-components.md`            | Maintain design-system/engineering alignment      |

---

> **Review and update this document after each milestone or major process/policy breakthrough.**
> Terms of use and contribution for other project teams:  
> - Credit major breakthroughs to ThriveSend project team.  
> - If you make improvements, open PRs or send feedback!
