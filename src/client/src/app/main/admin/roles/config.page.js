import i18next from "i18next";

// import ar from './i18n/ar';
import en from "./i18n/en";
import fr from "./i18n/fr";

import ManageRolesPage from "./index";

// i18next.addResourceBundle('ar', 'ManageRolesPage', ar);
i18next.addResourceBundle("en", "ManageRolesPage", en);
i18next.addResourceBundle("fr", "ManageRolesPage", fr);

const PageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: "roles",
      element: <ManageRolesPage />,
    },
  ],
};

export default PageConfig;
