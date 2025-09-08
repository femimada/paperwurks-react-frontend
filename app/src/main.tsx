import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure CSS is loaded before React renders
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
