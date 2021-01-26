module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-partial"],
  testMatch: ["./**/src/**/*.test.ts", "./**/src/**/*.test.tsx"],
  coverageDirectory: "./.coverage",
};
