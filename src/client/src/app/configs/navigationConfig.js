import i18next from "i18next";

// import ar from './navigation-i18n/ar';
import en from "./navigation-i18n/en";
import fr from "./navigation-i18n/fr";

// i18next.addResourceBundle('ar', 'navigation', ar);
i18next.addResourceBundle("en", "navigation", en);
i18next.addResourceBundle("fr", "navigation", fr);

const navigationConfig = [
  {
    id: "dashboards",
    title: "Dashboards",
    subtitle: "",
    type: "group",
    icon: "heroicons-outline:home",
    translate: "ADMIN_LANG_DASHBOARDS",
    children: [
      {
        id: "dashboards.analytics",
        title: "Analytics",
        type: "item",
        icon: "heroicons-outline:chart-pie",
        url: "/dashboards/analytics",
      },
    ],
  },
  {
    id: "managements",
    title: "Management",
    subtitle: "",
    type: "group",
    icon: "heroicons-outline:home",
    translate: "MANAGEMENTS",
    children: [
      {
        id: "page-users",
        title: "User Manage",
        translate: "ADMIN_LANG_USER_MANAGE",
        type: "item",
        icon: "heroicons-outline:star",
        url: "users",
      },
      {
        id: "page-roles",
        title: "Role Manage",
        translate: "ADMIN_LANG_ROLE_MANAGE",
        type: "item",
        icon: "heroicons-outline:star",
        url: "roles",
      },
    ],
  },
];

export default navigationConfig;
