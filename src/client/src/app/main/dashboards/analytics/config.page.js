import { lazy } from "react";

const AnalyticsDashboardPage = lazy(() => import("./index"));

const AnalyticsDashboardPageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: "/dashboards",
      element: <AnalyticsDashboardPage />,
    },
  ],
};

export default AnalyticsDashboardPageConfig;
