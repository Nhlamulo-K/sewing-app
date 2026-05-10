module.exports = {
  testEnvironment: 'node',
  runInBand: true,
  forceExit: true,
  testTimeout: 10000,
  globalTeardown: './src/tests/teardown.js',
};