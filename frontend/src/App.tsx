import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import Catalog from './pages/Catalog';
import AdminSarees from './pages/AdminSarees';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';

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

const adminSareesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/sarees',
  component: AdminSarees,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: AdminOrders,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/customers',
  component: AdminCustomers,
});

const routeTree = rootRoute.addChildren([
  catalogRoute,
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
