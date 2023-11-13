import i18next from "i18next";
import { authRoles } from "src/app/auth";

// import ar from './i18n/ar';
import en from "./i18n/en";
import fr from "./i18n/fr";

import ManageCategoryPage from "./index";

// i18next.addResourceBundle('ar', 'ManageCategoryPage', ar);
i18next.addResourceBundle("en", "ManageCategoryPage", en);
i18next.addResourceBundle("fr", "ManageCategoryPage", fr);

const PageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.admin,
  routes: [
    {
      path: "category",
      element: <ManageCategoryPage />,
    },
  ],
};

export default PageConfig;
