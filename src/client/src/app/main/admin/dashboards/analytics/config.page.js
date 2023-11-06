import { lazy } from 'react';
import { authRoles } from 'src/app/auth';

const AnalyticsDashboardPage = lazy(() => import('./index'));

const AnalyticsDashboardPageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.admin,
  routes: [
    {
      path: 'dashboards/analytics',
      element: <AnalyticsDashboardPage />,
    },
  ],
};

export default AnalyticsDashboardPageConfig;
