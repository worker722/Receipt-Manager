import i18next from "i18next";

// import ar from './i18n/ar';
import en from "./i18n/en";
import fr from "./i18n/fr";

import { authRoles } from "src/app/auth";

import AllExpensesPage from "./index";

// i18next.addResourceBundle('ar', 'ManageExpensesPage', ar);
i18next.addResourceBundle("en", "AllExpensesPage", en);
i18next.addResourceBundle("fr", "AllExpensesPage", fr);

const PageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: "me/expenses",
      element: <AllExpensesPage />,
    },
  ],
};

export default PageConfig;
