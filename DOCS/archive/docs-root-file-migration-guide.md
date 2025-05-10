# ThriveSend Docs Cleanup Guide: Moving & Archiving Standalone Files

_This document provides explicit, step-by-step instructions for moving or archiving any remaining standalone markdown files in the `/DOCS` root. These steps ensure that your documentation complies with project rules on organization, discoverability, and canonical sources._

---

## Step-by-Step Consolidation & Archiving

### 1. **colour_scheme.md**

- **Recommended Action:**  
  - If `/DOCS/design-system/colour_scheme.md` exists and contains the up-to-date, canonical color policy, archive (or remove) `/DOCS/colour_scheme.md`.
  - If these differ, manually merge missing info into the subfolder version and then archive/delete the root copy.

- **How to Archive:**  
  - Move to `/DOCS/archive/colour_scheme.md.old`
  - Or, if superseded by the design-system copy, simply delete

---

### 2. **implementation-plan.md**

- **Recommended Action:**  
  - If `/DOCS/planning/implementation-plan.md` exists and is current, archive `/DOCS/implementation-plan.md`.
  - If root and planning versions differ, consolidate: merge unique/important content from both, keep the most complete version in `/planning/implementation-plan.md`, and archive the root file.

- **How to Archive:**  
  - Move to `/DOCS/archive/implementation-plan.md.old`
  - Or, after merge, delete the root file

---

### 3. **progress-snapshot.md**

- **Recommended Action:**  
  - If `/DOCS/progress/progress-snapshot.md` is present and up to date, archive root `/DOCS/progress-snapshot.md`.
  - If root and subfolder versions are different, compare snapshots: merge or preserve historic info as needed (for example, keep old snapshots in `/archive/`).

- **How to Archive:**  
  - Move to `/DOCS/archive/progress-snapshot.md.YYYY-MM-dd`
  - Or, after comparison, delete the root file

---

### 4. **project-progress.md**

- **Recommended Action:**  
  - Ensure `/DOCS/progress/project-progress.md` is canonical and retains all recent progress info.
  - Archive the root `/DOCS/project-progress.md` unless it contains unique history, in which case, merge relevant changes then archive or delete root copy.

- **How to Archive:**  
  - Move to `/DOCS/archive/project-progress.md.old`
  - Or, after validation/merge, delete

---

## General Notes

- **Never simply delete unless you are 100% sure that no unique content is being lost.** Archiving preserves audit trails, onboarding history, and regression points.
- **Update any cross-links** or documentation index files (e.g. `/DOCS/README.md`) to eliminate references to root markdown files that are no longer canonical.
- **If you find document conflicts, resolve them by manual merge, noting your actions in the `/archive` copy’s comments header.**
- **You may also compress/archive old snapshots as `progress-snapshot.2024-06-dd.md` or by date if you want to preserve project history.**

---

## Final DOCS Root Should Only Contain

- Subfolders: `architecture/`, `archive/`, `automation/`, `canonicals/`, `design-system/`, `guides/`, `management/`, `planning/`, `progress/`, `checklists/`
- Key meta files: `README.md`, `migration-checklist.md`, and project-wide index/guideline files (e.g., `project-development-rules.md`)

---

**Maintainers and contributors:**  
Whenever you see a markdown file in the DOCS root not listed above, use this guide to archive or migrate it!