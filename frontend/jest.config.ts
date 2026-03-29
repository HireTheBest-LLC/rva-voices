import type { Config } from "jest";

/**
 * Jest configuration for RVA Voices frontend.
 *
 * Uses ts-jest to run TypeScript tests without a separate build step.
 * jsdom provides a browser-like environment for React component tests.
 * @testing-library/jest-dom is imported directly in each test file.
 */
const config: Config = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
      },
    }],
  },
  moduleNameMapper: {
    // Resolve Next.js path alias @/ → src/
    "^@/(.*)$": "<rootDir>/src/$1",
    // Stub CSS imports (Leaflet/leaflet.css, etc.)
    "^.+\\.css$": "<rootDir>/src/__mocks__/styleMock.ts",
    // Stub static asset imports
    "^.+\\.(png|jpg|jpeg|svg|gif|webp)$": "<rootDir>/src/__mocks__/fileMock.ts",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/**/__mocks__/**",
  ],
};

export default config;
