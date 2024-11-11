import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthContextProvider } from 'contexts/AuthContext';

const App: React.FC = () => (
  <Router>
    <AuthContextProvider>
      <AppRoutes />
    </AuthContextProvider>
  </Router>
);

export default App;
