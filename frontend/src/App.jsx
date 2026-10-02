import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './pages/layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Bookings from './pages/Bookings';
import Transactions from './pages/Transactions';
import Issues from './pages/Issues';
import Maintenance from './pages/Maintenance';
import Labs from './pages/Labs';
import Categories from './pages/Categories';
import Users from './pages/Users';
import QRScannerPage from './pages/QRScannerPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const STAFF = ['ADMIN', 'LAB_ASSISTANT'];

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected app shell — every route below shares the sidebar/nav layout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/qr-scanner" element={<QRScannerPage />} />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={STAFF}>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={STAFF}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
