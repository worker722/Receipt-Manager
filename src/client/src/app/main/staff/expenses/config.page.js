import i18next from "i18next";

// import ar from './i18n/ar';
import en from "./i18n/en";
import fr from "./i18n/fr";

import { authRoles } from "src/app/auth";

import ManageExpensesPage from "./index";

// i18next.addResourceBundle('ar', 'ManageExpensesPage', ar);
i18next.addResourceBundle("en", "ManageExpensesPage", en);
i18next.addResourceBundle("fr", "ManageExpensesPage", fr);

const PageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.staff,
  routes: [
    {
      path: "expenses",
      element: <ManageExpensesPage />,
    },
  ],
};

export default PageConfig;
