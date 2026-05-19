# Mnemos — Release & Promotion Pipeline

This document defines the branching strategy, continuous integration checks, and continuous deployment workflows for **Mnemos**.

---

## 🌳 1. Git Branching Strategy

To maintain a clean and reliable release history, Mnemos uses three primary layers of branching:

```text
main (production)
  ▲
  │ (automated promotion or stable merge)
  │
dev (integration / test environment)
  ▲
  │ (pull request with Enkii review)
  │
feat/* or fix/* (developer & agent feature branches)
```

### Branch Definitions

1. **`main`**: Production source branch. 
   - Always stable, fully tested, and ready for deployment.
   - Deploys automatically to production hosting platforms (e.g. Vercel for the frontend, custom hosting for the backend).
   - Protected: Direct push is strictly disabled. All changes must be promoted from `dev` via Pull Requests.

2. **`dev`**: Integration and pre-production branch.
   - Active development integration branch.
   - All feature branches (`feat/*`) and bug fixes (`fix/*`) are merged into `dev` first.
   - Changes are verified here under staging databases before pushing to `main`.

3. **`feat/*` & `fix/*`**: Task-specific developer and agent branches.
   - Created off the latest state of the `dev` branch.
   - Example naming: `feat/pos-discount-support`, `fix/sku-uniqueness-validation`.
   - Deleted once merged into `dev`.

---

## 🤖 2. Automated PR Review with Enkii

We use **Enkii**, a repo-native, AI-powered code review GitHub Action, to automatically review and sanitize code changes on every pull request targeting `dev` or `main`.

### Workflow Location
The workflow is defined under [`.github/workflows/enkii-review.yml`](file:///c:/Dev/Inventory/.github/workflows/enkii-review.yml).

### Features of the Review Pipeline
- **Auto-Review on PR Events**: Triggers automatically when a Pull Request is opened, synchronized (new commits pushed), or reopened.
- **On-Demand Bot Commands**: Developers can request targeted actions directly in PR comment sections:
  - `@enkii /review`: Re-runs the full AI code review.
  - `@enkii /security`: Performs a focused scan on security concerns, credentials leakage, and query scoping breaches.
  - `@enkii /benchmark`: Runs a fresh code review ignoring prior PR review comments.
  - `@enkii status`: Displays the execution status of the current review job.
- **Tenant Isolation Security Checks**: Enkii is trained to scan backend changes for direct models access, ensuring database transactions use the scoped `req.db` client rather than the global `internal_unscoped_prisma` client.

---

## 🧪 3. Automated Pre-Commit Hook (Quality Gates)

We have configured an automated Git **`pre-commit`** hook under [`.git/hooks/pre-commit`](file:///c:/Dev/Inventory/.git/hooks/pre-commit) to enforce code quality before a commit is finalized.

Whenever you run `git commit`, the hook automatically:
1. Detects which files have staged changes.
2. If changes are inside `frontend/`:
   - Runs `npm run lint` (ESLint validation).
   - Runs `npm run build` (TypeScript and Vite compiles).
3. If changes are inside `backend/`:
   - Runs `npm run build` (Prisma client generation and TypeScript build checks).
4. If any verification step fails, it aborts the commit process immediately, protecting the remote branches from broken pushes.

### Bypassing the Hook (Emergency Only)
If you need to bypass quality gates temporarily (e.g., commit a work-in-progress to another machine), you can append `--no-verify` to your commit command:
```bash
git commit -m "wip: active work in progress" --no-verify
```

---

## 🚀 4. Deployment Checklists

### Pre-Deployment Check
- [ ] Database migrations are successfully generated and applied: `npx prisma migrate dev`
- [ ] Prisma Client is generated in the target hosting environment: `npx prisma generate`
- [ ] Local frontend and backend builds are compiled without errors.
- [ ] No un-scoped database connections or credentials are hardcoded.

### Post-Deployment Check
- [ ] Verify health check endpoint: `/api/health` returns `{"status":"ok"}`.
- [ ] Verify connection to the Supabase database.
- [ ] Confirm frontend routing transitions smoothly under `<AnimatedPage>`.
