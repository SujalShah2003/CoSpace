import AdminDashboardPage from './AdminDashboardPage';
import MemberDashboardPage from './MemberDashboardPage';
import { getCurrentUser } from '@/utils/auth';

const DashboardPage = () =>
  getCurrentUser()?.role === 'admin' ? (
    <AdminDashboardPage />
  ) : (
    <MemberDashboardPage />
  );

export default DashboardPage;
