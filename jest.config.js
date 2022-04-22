module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transform: {
    '.(ts)': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|js)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
};
