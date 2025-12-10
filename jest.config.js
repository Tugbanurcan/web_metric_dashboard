const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js uygulamasının yolu
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)