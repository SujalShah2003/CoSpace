import { Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { isAuthenticated } from '@/utils/auth';

const ProtectedAdminLayout = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ returnTo: location.pathname }}
      />
    );
  }

  return <AdminLayout />;
};

export default ProtectedAdminLayout;
