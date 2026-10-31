module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/@env.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-notify-kit|react-native-safe-area-context|react-native-screens|react-native-gesture-handler)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
