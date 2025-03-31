module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageReporters: ['text', 'lcov'],
    coverageDirectory: 'coverage',
    testMatch: ['**/__tests__/**/*.test.js'],
    moduleFileExtensions: ['js', 'json', 'node']
  };