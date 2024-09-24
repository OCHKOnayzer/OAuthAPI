/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transformIgnorePatterns: [
      '<rootDir>/node_modules/(?!chai-as-promised|check-error)' // чтобы обойти проблему с импортами из node_modules
    ],
  };
  
  module.exports = config;
  