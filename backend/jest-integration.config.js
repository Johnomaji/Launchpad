module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.integration.spec.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/$1',
    '^@users/(.*)$': '<rootDir>/users/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@auth/(.*)$': '<rootDir>/auth/$1',
    '^@coin-creator/(.*)$': '<rootDir>/coin-creator/$1',
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coveragePathIgnorePatterns: [
    '.module.ts$',
    '.mock.ts$',
    '.dto.ts$',
    '.entity.ts$',
    '.spec.ts$',
    '.integration.spec.ts$',
  ],
};
