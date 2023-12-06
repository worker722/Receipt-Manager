import i18next from "i18next";

// import ar from './i18n/ar';
import en from "./i18n/en";
import fr from "./i18n/fr";

import { authRoles } from "src/app/auth";

import ReportPage from "./ReportPage";
import ReportsPage from "./ReportsPage";

// i18next.addResourceBundle('ar', 'ReportPage', ar);
i18next.addResourceBundle("en", "ReportsPage", en);
i18next.addResourceBundle("fr", "ReportsPage", fr);

const PageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.staff,
  routes: [
    {
      path: "reports/:reportId",
      element: <ReportPage />,
    },
    {
      path: "reports",
      element: <ReportsPage />,
    },
  ],
};

export default PageConfig;
