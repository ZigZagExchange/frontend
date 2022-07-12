module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: "latest",
    requireConfigFile: false,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      presets: [
        '@babel/preset-env', 
        '@babel/preset-react'
      ],
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  rules: {
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    "react/react-in-jsx-scope": "off",
    "no-restricted-imports": "off",
    "react/prop-types": "off",
    "react/no-find-dom-node": "off",
    "react/no-unescaped-entities": "off",
    "react/no-string-refs": "off",
  },
};
