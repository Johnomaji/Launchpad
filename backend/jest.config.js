/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', {}],
  },
  moduleNameMapper: {
  	'^@src/(.*)$': '<rootDir>/src/$1',
    '^@users/(.*)$': '<rootDir>/src/users/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@coin-creator/(.*)$': '<rootDir>/src/coin-creator/$1',
  },
  preset: 'ts-jest/presets/default-esm',
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
      "** / *.(t|j)s"
  ],
  // setupFilesAfterEnv: ['./jest.setup.ts'],
};

/**
 *   "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "** / *.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }

*/
