// Mock for styled-jsx
const React = require('react');

// Mock the style jsx component
const MockStyleJSX = ({ children, ...props }) => {
  // Return null since we don't need to render styles in tests
  return null;
};

// The jsx property should be a function that returns a component
const jsxFunction = () => MockStyleJSX;

module.exports = {
  default: MockStyleJSX,
  jsx: jsxFunction,
  css: () => '',
  global: MockStyleJSX,
  resolve: () => '',
  flush: () => null,
  injectGlobal: () => null,
  keyframes: () => '',
  sheet: {
    inserted: [],
    injected: false,
    insert: () => {},
    flush: () => {},
  },
};
