module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
  },
  env: {
    browser: true,
    node: true,
    jest: true, // Include Jest environment for test globals
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended', // Extend Jest recommended rules
  ],
  plugins: ['react', 'jest'], // Add Jest plugin
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
  },
  rules: {
    'react/prop-types': 'off', // Disable prop-types validation
    'no-console': 'off', // Disable console statement warning
    'react/react-in-jsx-scope': 'off', // React 17+ does not need React in scope
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
