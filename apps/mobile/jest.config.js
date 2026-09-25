module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@etulamaan/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@etulamaan/ui-kit$': '<rootDir>/../../packages/ui-kit/src',
    '^@react-native-async-storage/async-storage$': '<rootDir>/test/asyncStorageMock.ts',
    '^expo-secure-store$': '<rootDir>/test/secureStoreMock.ts'
  }
};