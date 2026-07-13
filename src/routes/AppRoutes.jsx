import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import PortalLayout from '../layouts/PortalLayout';
import ProtectedRoute from '../components/shared/ProtectedRoute';

import Dashboard from '../pages/admin/Dashboard';
import FormList from '../pages/admin/FormList';
import FormBuilder from '../pages/admin/FormBuilder';
import Submissions from '../pages/admin/Submissions';
import Users from '../pages/admin/Users';
import Settings from '../pages/admin/Settings';
import Login from '../pages/admin/Login';

import BrandSelect from '../pages/portal/BrandSelect';
import DynamicForm from '../pages/portal/DynamicForm';
import ThankYou from '../pages/portal/ThankYou';

import FormAnalysis from '../pages/admin/FormAnalysis';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="forms" element={<FormList />} />
          <Route path="forms/new" element={<FormBuilder />} />
          <Route path="forms/edit/:id" element={<FormBuilder />} />
          <Route path="forms/analysis/:id" element={<FormAnalysis />} />
          <Route path="submissions" element={<Submissions />} />
          
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<BrandSelect />} />
        <Route path="form/:brandId" element={<DynamicForm />} />
        <Route path="form/:brandId/:formId" element={<DynamicForm />} />
        <Route path="thank-you/:brandId" element={<ThankYou />} />
      </Route>

      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}
