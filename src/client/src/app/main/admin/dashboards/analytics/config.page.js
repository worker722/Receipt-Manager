import { lazy } from 'react';

const AnalyticsDashboardPage = lazy(() => import('./index'));

const AnalyticsDashboardPageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: 'dashboards/analytics',
      element: <AnalyticsDashboardPage />,
    },
  ],
};

export default AnalyticsDashboardPageConfig;
