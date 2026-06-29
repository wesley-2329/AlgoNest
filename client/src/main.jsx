import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // Import the provider
import { ThemeProvider } from './components/ThemeProvider.jsx'; 
import axios from 'axios'; // Import axios


// This line tells axios to ALWAYS send cookies with every request
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> {/* Wrap here */}
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
