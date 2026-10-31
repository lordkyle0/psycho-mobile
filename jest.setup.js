/* eslint-env jest */

// AsyncStorage en mémoire : permet de tester la base locale et la fusion de synchronisation.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  const api = {
    setItem: jest.fn(async (k, v) => {
      store.set(k, v);
    }),
    getItem: jest.fn(k => Promise.resolve(store.has(k) ? store.get(k) : null)),
    removeItem: jest.fn(async k => {
      store.delete(k);
    }),
    getAllKeys: jest.fn(() => Promise.resolve([...store.keys()])),
    getMany: jest.fn(keys =>
      Promise.resolve(
        Object.fromEntries(
          keys.map(k => [k, store.has(k) ? store.get(k) : null]),
        ),
      ),
    ),
    clear: jest.fn(async () => {
      store.clear();
    }),
  };
  return { __esModule: true, default: api, ...api };
});

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() =>
      Promise.resolve({ isConnected: true, isInternetReachable: true }),
    ),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

jest.mock('react-native-notify-kit', () =>
  require('react-native-notify-kit/jest-mock'),
);
