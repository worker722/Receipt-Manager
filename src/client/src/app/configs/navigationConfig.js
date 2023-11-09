import i18next from "i18next";

// import ar from './navigation-i18n/ar';
import en from "./navigation-i18n/en";
import fr from "./navigation-i18n/fr";

import { authRoles } from "../auth";

// i18next.addResourceBundle('ar', 'navigation', ar);
i18next.addResourceBundle("en", "navigation", en);
i18next.addResourceBundle("fr", "navigation", fr);

const navigationConfig = [
  {
    id: "dashboards",
    title: "Dashboards",
    type: "item",
    icon: "heroicons-outline:home",
    translate: "LANG_DASHBOARDS",
    url: "/dashboards",
  },

  // Admin routes
  {
    id: "managements",
    title: "Management",
    subtitle: "",
    type: "group",
    auth: authRoles.admin,
    icon: "heroicons-outline:home",
    translate: "MANAGEMENTS",
    children: [
      {
        id: "page-roles",
        title: "Role Manage",
        translate: "ADMIN_LANG_ROLE_MANAGE",
        type: "item",
        icon: "heroicons-outline:star",
        url: "roles",
      },
      {
        id: "page-users",
        title: "User Manage",
        translate: "ADMIN_LANG_USER_MANAGE",
        type: "item",
        icon: "heroicons-outline:user-group",
        url: "users",
      },
    ],
  },

  // Staff routes
];

export default navigationConfig;
