import { createBrowserRouter } from 'react-router-dom';
import MasterLayout from '@/layouts/MasterLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedAdminLayout from '@/layouts/ProtectedAdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AvailableSpacesPage from '@/pages/admin/AvailableSpacesPage';
import BookNowPage from '@/pages/admin/BookNowPage';
import MyBookingsPage from '@/pages/admin/MyBookingsPage';
import SpaceFormPage from '@/pages/admin/SpaceFormPage';
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import HomePage from '@/pages/home/HomePage';

export const routes = createBrowserRouter(
  [
    {
      Component: AuthLayout,
      children: [
        {
          path: 'signin',
          Component: SignInPage,
        },
        {
          path: 'signup',
          Component: SignUpPage,
        },
      ],
    },
    {
      path: 'admin',
      Component: ProtectedAdminLayout,
      children: [
        {
          index: true,
          Component: AdminDashboardPage,
        },
        {
          path: 'bookings',
          Component: AvailableSpacesPage,
        },
        {
          path: 'bookings/new',
          Component: BookNowPage,
        },
        {
          path: 'my-bookings',
          Component: MyBookingsPage,
        },
        {
          path: 'spaces/new',
          Component: SpaceFormPage,
        },
        {
          path: 'spaces/:spaceId/edit',
          Component: SpaceFormPage,
        },
      ],
    },
    {
      Component: MasterLayout,
      children: [
        {
          index: true,
          Component: HomePage
        },
        {
          path: '*',
          Component: HomePage
        }
      ]
    }
  ],
  { basename: '/' }
);
