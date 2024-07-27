 // Mock the API response
 module.exports = {
   roots: ["<rootDir>/src"],
   testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
   transform: {
     "^.+\\.(ts|tsx)$": "ts-jest"
   },
   moduleNameMapper: {
     "^@/(.*)$": "<rootDir>/src/$1"
   },
   collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}", "!src/**/*.d.ts"],
   coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/src/index.ts", "/src/__tests__/"],
   moduleNameMapper: {
     "@util/(.*)": "<rootDir>/src/internal/util/$1",
     "@api/(.*)": "<rootDir>/src/api/$1",
     "@internal/(.*)": "<rootDir>/src/internal/$1",
     "@infra/(.*)": "<rootDir>/src/infra/$1"
   },
   coverageReporters: ["lcov", "text-summary"],
   testEnvironment: "node"
 };