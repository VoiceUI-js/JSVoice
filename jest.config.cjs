// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./test/setupTests.js'], // For common setup, like mocking Web Speech API
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Use babel-jest for .js and .jsx files
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  // Add coverage if desired
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html'],
  // Define global mocks if needed (see setupTests.js)
};