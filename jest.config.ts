import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{ tsconfig: "tsconfig.jest.json" }],
  },
  testMatch: [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec).[jt]s?(x)" ],
  testPathIgnorePatterns: ['/__tests__/']
};

export default config;