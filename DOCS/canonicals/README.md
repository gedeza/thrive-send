# 📚 ThriveSend Documentation Directory

Welcome to the **ThriveSend Documentation Directory**. This folder contains all project-level specifications, implementation plans, audits, guides, and reusable processes.

---

## 🚦 **Project Progress Snapshot**

**Platform Progress:** [████████████████--------------------] **40%**

- Core navigation and sidebar components are completed and fully responsive.
- Calendar, dashboard, and landing UI sections are significantly improved.
- Enhanced documentation and clearer code structure.
- **Next up:** Authentication flows, mobile optimizations, advanced analytics, and deeper content management features.

---

## 🧭 Navigation Guide

To help contributors, designers, and maintainers find the right source of truth, we use a **categorized structure**. All major docs are grouped by type and canonical references are explicitly noted.

---

### 🏆 **Quick Start: The Canonicals**

- [`PRD.md`](PRD.md): **Product Requirements Document** – The official source of what ThriveSend is and will be.
- [`README.md`](../README.md): Project root introduction & must-read onboarding.
- [`colour_scheme.md`](colour_scheme.md): The only approved color system for all code and design.
- [`project-development-rules.md`](project-development-rules.md): The enforced rules for process, doc, and implementation discipline across milestones.

---

### 🛠️ **Implementation Planning & Progress**

- [`implementation-plan.md`](implementation-plan.md): High-level and per-milestone technical planning.
- [`remaining-implementation-tasks.md`](remaining-implementation-tasks.md): The actionable feature/task backlog.
- [`progress-snapshot.md`](progress-snapshot.md): Snapshots and rolling summaries of team and module progress.
- [`project-reset-plan.md`](project-reset-plan.md): Playbook for pivots or major project-level resets.

---

### 🎨 **Design System & Color Compliance**

- [`colour_scheme.md`](colour_scheme.md): Semantic color/tokens: always reference this.
- [`color_scheme_compliance_audit.md`](color_scheme_compliance_audit.md): Audits and checklists for color system enforcement.
- [`eslint-color-token-enforcement.md`](eslint-color-token-enforcement.md): ESLint config and rule details for color usage.

---

### 🏗️ **Architecture & UI Components**

- [`component-architecture.md`](component-architecture.md): UI/Component design patterns and structure.
- [`ui-components.md`](ui-components.md): Best practices for building reusable components.
- [`ui-consistency-guide.md`](ui-consistency-guide.md): Keeping UI consistent across modules.
- [`theme-integration-guide.md`](theme-integration-guide.md): How to integrate themes beyond just colors.
- [`SETUP_STORYBOOK.md`](SETUP_STORYBOOK.md): How to set up and use Storybook in this codebase.

#### UI Component Documentation

Our Marketing Platform UI provides a set of reusable components designed to create a seamless user experience:

1. **Sidebar Navigation**
   - Persistent navigation across the entire application
   - Responsive design that adapts to different screen sizes

2. **Tabs Component**
   - Support for both horizontal and vertical orientation
   - Responsive design that adapts to mobile devices
   - Accessible (follows WAI-ARIA guidelines)

3. **Campaign Components**
   - Form validation
   - Date selection for campaign duration
   - Budget input and target audience specification

4. **Content Management**
   - Rich text editing
   - Media uploads
   - Content categorization and tagging system

---

### 🔄 **Workflow & Automation Docs**

- [`git-workflow.md`](git-workflow.md): Our accepted git conventions, branching, and merge strategies.
- [`task_doc_reconciliation.json`](task_doc_reconciliation.json): Scripts and JSON for automating task/doc compliance.
- [`doc_implementation_alignment_process.md`](doc_implementation_alignment_process.md): Make sure docs actually reflect what's implemented.

---

### 🔑 **Authentication & Integration Guides**

- [`authentication-alternatives.md`](authentication-alternatives.md): Other ways to handle auth if not using the main setup.
- [`clerk-setup-guide.md`](clerk-setup-guide.md): Walkthrough for Clerk authentication.
- [`api-integration-guide.md`](api-integration-guide.md): How to integrate with backend APIs.

---

### 📈 **Project Management & Product Artifacts**

- [`MVP_Specification.md`](MVP_Specification.md): Agreed minimal feature set.
- [`client-management-plan.md`](client-management-plan.md): How to manage client relationships through features and modules.

---

## 📑 For All Contributors

- Start with [`project-development-rules.md`](project-development-rules.md) before editing, writing, or moving any doc.
- If contributing new features/processes, ensure your new docs or scripts are discoverable here.
- Propose edits to this file whenever you reorganize or add new major documents.

---

This structure is regularly re-audited and improved. **Thank you for helping make ThriveSend clearer, more maintainable, and future-proof!**
