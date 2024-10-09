import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Router>
            <ErrorBoundary>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ErrorBoundary>
        </Router>
    </React.StrictMode>
);
