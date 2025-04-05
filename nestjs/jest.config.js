/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', {}],
  },
  moduleNameMapper: {
    '^@users/(.*)$': '<rootDir>/src/users/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!@mysten/sui)'], // setupFilesAfterEnv: ['./jest.setup.js'],
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
