// jest.config.mjs - Root Jest configuration file

export default {
  // Base configuration for all tests
  projects: [
    // Server-side tests configuration
    // {
    //   displayName: 'server',
    //   testEnvironment: 'node',
    //   transform: {},
    //   testMatch: ['<rootDir>/server/tests/**/*.test.js'],
    //   moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
    //   // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    //   coverageDirectory: '<rootDir>/coverage/server',
    //   collectCoverageFrom: [
    //     'server/src/**/*.js',
    //     '!server/src/config/**',
    //     '!**/node_modules/**',
    //   ],
    // },
    
    // Client-side tests configuration
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.{js,jsx}'],
      moduleFileExtensions: ['js', 'jsx', 'json'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/client/src/tests/__mocks__/fileMock.js',
      },
      // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      coverageDirectory: '<rootDir>/coverage/client',
      collectCoverageFrom: [
        'client/src/**/*.{js,jsx}',
        '!client/src/index.js',
        '!**/node_modules/**',
      ],
    },
  ],
  
  // Global configuration
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  testTimeout: 10000,
}; 