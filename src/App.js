import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoyaltyProgramDashboard from './components/loyapro-dashboard';
import Register from './components/Register';
import Login from './components/Login';
import Navigation from './components/Navigation';
import ErrorBoundary from './ErrorBoundary';
import VerifyEmailPage from './components/VerifyEmailPage';
import MachinesPage from './components/MachinesPage';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const MachineRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  const hasUserData = localStorage.getItem('user');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasUserData) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            {/* <Route 
              path="/verify-email/:token" 
              element={
                <VerifyEmailPage />
                } 
            /> */}
            <Route 
              path="/machines" 
              element={
                <MachineRoute>
                  <MachinesPage />
                </MachineRoute>
              } 
            />
            <Route 
              path="/verify-email" 
              element={<VerifyEmailPage />} 
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <LoyaltyProgramDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;