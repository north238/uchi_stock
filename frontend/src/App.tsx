import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthContextProvider } from 'contexts/AuthContext';
import { LoadingProvider } from 'contexts/LoadingContext';

const App: React.FC = () => (
  <Router>
    <LoadingProvider>
      <AuthContextProvider>
        <AppRoutes />
      </AuthContextProvider>
    </LoadingProvider>
  </Router>
);

export default App;
