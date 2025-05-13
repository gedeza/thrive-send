# Content Calendar API Test Guide

These instructions explain how to run your Node (server/API) tests for the Content Calendar.

---

## 1. Ensure dependencies are installed

```bash
pnpm install
# or
npm install
# or
yarn install
```

## 2. Run the tests

You can run all tests (including these API tests):

```bash
pnpm test
# or
npm test
# or
yarn test
```

If you want to run only the API test suite (for faster feedback):

```bash
pnpm jest __tests__/api/
# or
npx jest __tests__/api/
```

## 3. Notes

- The three main API test files now use the correct `@jest-environment node` pragma at the top. This ensures your HTTP server tests run in a true Node.js environment and not in jsdom.
- If you see database or auth errors, make sure your database and authentication mocks/configs are set up as required for your environment.

## 4. Troubleshooting

- **Test process hangs or fails:** Make sure your API handlers clean up opened servers/connections, as in the samples.
- **Environment errors:** Confirm you do not use browser-only globals in these server-side test files.
- **Database issues:** Ensure your test database is running and up-to-date.

## 5. Additional Resources

- [Jest: Using TestEnvironment](https://jestjs.io/docs/configuration#testenvironment-string)
- [Supertest Docs](https://github.com/visionmedia/supertest)

---