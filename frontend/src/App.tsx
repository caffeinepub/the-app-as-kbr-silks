import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import Layout from './components/Layout';
import Catalog from './pages/Catalog';
import AdminSarees from './pages/AdminSarees';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import OwnerVerificationGate from './components/OwnerVerificationGate';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Catalog,
});

// Redirect /admin → /admin/sarees
const adminIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    throw redirect({ to: '/admin/sarees' });
  },
});

const adminSareesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/sarees',
  component: () => (
    <OwnerVerificationGate>
      <AdminSarees />
    </OwnerVerificationGate>
  ),
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: () => (
    <OwnerVerificationGate>
      <AdminOrders />
    </OwnerVerificationGate>
  ),
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/customers',
  component: () => (
    <OwnerVerificationGate>
      <AdminCustomers />
    </OwnerVerificationGate>
  ),
});

const routeTree = rootRoute.addChildren([
  catalogRoute,
  adminIndexRoute,
  adminSareesRoute,
  adminOrdersRoute,
  adminCustomersRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
