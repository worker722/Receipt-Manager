import { lazy } from 'react';
import { authRoles } from 'src/app/auth';

const AnalyticsDashboardPage = lazy(() => import('./index'));

const AnalyticsDashboardPageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: '/dashboards',
      element: <AnalyticsDashboardPage />,
    },
  ],
};

export default AnalyticsDashboardPageConfig;
