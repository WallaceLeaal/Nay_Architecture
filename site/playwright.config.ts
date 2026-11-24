import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  workers: 1,
  use: {
    baseURL: process.env.ADMIN_TEST_ORIGIN ?? "http://localhost:3000",
    channel: process.env.ADMIN_TEST_BROWSER ?? "msedge",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Edge"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
});
