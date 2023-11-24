import i18next from "i18next";
import { authRoles } from "src/app/auth";

// import ar from './i18n/ar';
import en from "./i18n/en";
import fr from "./i18n/fr";

import ManageReceiptPage from "./index";

// i18next.addResourceBundle('ar', 'ManageReceiptPage', ar);
i18next.addResourceBundle("en", "ManageReceiptPage", en);
i18next.addResourceBundle("fr", "ManageReceiptPage", fr);

const PageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: "receipt",
      element: <ManageReceiptPage />,
    },
  ],
};

export default PageConfig;
