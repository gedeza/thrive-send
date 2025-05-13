# Testing Strategy & Planner

## **When to Run Tests**
- **Before** every code commit (`git commit`) and push (CI will run them anyway!)
- **After** any dependency or major library upgrade (including Prisma, next, clerk, etc)
- **Before** and **after** merges into `main` or staging environments
- **Before** releases (run all tests + manual smoke test)

**Recommended:** Use a pre-push or commit hook to auto-run tests on changed files.

## **What Tests to Run & When**

| Situation                           | Command                                    | Scope                     |
|--------------------------------------|--------------------------------------------|---------------------------|
| Local change/small PR                | `npm test` or `pnpm test`                  | All tests                 |
| Working on API or backend logic      | `npm test api` / `pnpm test --filter=api`  | Only API tests            |
| Running only new/affected tests      | `npm test --changedSince=origin/main`      | What you touched          |
| During CI/CD pipeline                | `npm test`                                 | All tests                 |

## **How to Run Tests**

_Note: If using pnpm, swap `pnpm` for `npm` in the examples._

**All tests (standard):**
```bash
npm test
```
or
```bash
pnpm test
```

**A single file:**
```bash
npm test __tests__/api/content-calendar-api-error-auth.test.ts
```

**A whole folder:**
```bash
npm test __tests__/api
```

## **Best Practices**

- Write tests for every major feature, especially:
  - Error handling (invalid input, broken DB, permissions)
  - Auth/authorization (who can do what)
  - All happy (success) and unhappy (failure) flows
- Use mocks for external services (auth, email, etc) in tests
- Clean up your test database after (or before) runs
- Use CI for every PR (GitHub Actions or similar)
- Review test reports and address failures fast

## **Troubleshooting**

- If a test hangs, check for un-awaited async code or open DB handles.
- Watch for failing connection to test DB.
- Keep test users/roles in sync with your fixture/migrations.
- Use `.only` or `.skip` for debugging single failing tests.

## **Resources**
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Supertest Docs](https://www.npmjs.com/package/supertest)
- [Testing Next.js](https://nextjs.org/docs/pages/building-your-application/testing)

---

**Ask your tech lead, or refer to this doc whenever you:**
- Don’t know what tests to run
- Need to debug a broken feature
- Want to make sure you’re ready for production

---