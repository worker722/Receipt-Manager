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
    id: "admin_managements",
    title: "Management",
    subtitle: "",
    type: "group",
    auth: authRoles.admin,
    icon: "heroicons-outline:home",
    translate: "LANG_MANAGEMENTS",
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
      {
        id: "page-categories",
        title: "Category Manage",
        translate: "ADMIN_LANG_EXPENSE_CATEGORY_MANAGE",
        type: "item",
        icon: "feather:layers",
        url: "category",
      },
    ],
  },

  // Staff routes
  {
    id: "staff_managements",
    title: "Management",
    subtitle: "",
    type: "group",
    auth: authRoles.staff,
    icon: "heroicons-outline:home",
    translate: "LANG_MANAGEMENTS",
    children: [
      {
        id: "page-expenses",
        title: "Bank Expense Manage",
        translate: "STAFF_LANG_EXPENSE_MANAGE",
        type: "item",
        icon: "heroicons-outline:star",
        url: "expenses",
      },
      {
        id: "page-reports",
        title: "Reports Manage",
        translate: "STAFF_LANG_REPORT_MANAGE",
        type: "item",
        icon: "heroicons-outline:star",
        url: "reports",
      },
    ],
  },

  // User routes
  {
    id: "expense_managements",
    title: "Expenses",
    type: "item",
    auth: authRoles.user,
    icon: "heroicons-outline:home",
    translate: "USER_LANG_ALL_EXPENSE",
    url: "me/expenses",
  },
  {
    id: "report_managements",
    title: "Report Manage",
    type: "item",
    auth: authRoles.user,
    icon: "heroicons-outline:home",
    translate: "USER_LANG_REPORT_MANAGE",
    url: "me/reports",
  },
];

export default navigationConfig;
