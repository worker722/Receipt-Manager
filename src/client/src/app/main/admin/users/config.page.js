import i18next from 'i18next';

// import ar from './i18n/ar';
import en from './i18n/en';
import fr from './i18n/fr';

import ManageUsersPage from './index';

// i18next.addResourceBundle('ar', 'ManageUsersPage', ar);
i18next.addResourceBundle('en', 'ManageUsersPage', en);
i18next.addResourceBundle('fr', 'ManageUsersPage', fr);

const PageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: 'admin/users',
      element: <ManageUsersPage />,
    },
  ],
};

export default PageConfig;