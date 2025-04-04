module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.integration.spec.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
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
  moduleNameMapper: {
    '^@users/(.*)$': '<rootDir>/users/$1',
  },
};
