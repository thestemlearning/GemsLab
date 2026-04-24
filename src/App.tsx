/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/AuthRoutes';
import { Navbar } from './components/Navbar';

// Lazy loading pages later if needed, for now standard imports
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import Reports from './pages/Reports';
import Reprint from './pages/Reprint';
import Verify from './pages/Verify';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex bg-slate-50 text-slate-900 min-h-screen">
          <Navbar />
          <main className="flex-1 pl-64">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify/:reportId" element={<Verify />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/new-report" element={<NewReport />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reprint" element={<Reprint />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
