// src/index.js

// Import necessary polyfills for compatibility with older browsers
import 'core-js/stable'; // Polyfills for ES6+ features like promises, async/await, etc.
import 'regenerator-runtime/runtime'; // Polyfill for async/await support

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // CSS styles for the application
import App from './App'; // Main application component
import store from './store/store'; // Redux store
import { Provider } from 'react-redux'; // Redux Provider

// Polyfill for Buffer and process in the browser
import { Buffer } from 'buffer';
import process from 'process/browser';

// Ensure global variables are set for compatibility
window.Buffer = Buffer;
window.process = process;

// Create a root for React 18
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found!');
}

const root = ReactDOM.createRoot(rootElement);

// Render the App component within the Redux Provider
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
