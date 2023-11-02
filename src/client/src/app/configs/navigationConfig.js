import i18next from 'i18next';

// import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import fr from './navigation-i18n/fr';

// i18next.addResourceBundle('ar', 'navigation', ar);
i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('fr', 'navigation', fr);

const navigationConfig = [
  {
    id: 'dashboards',
    title: 'Dashboards',
    subtitle: 'Unique dashboard designs',
    type: 'group',
    icon: 'heroicons-outline:home',
    translate: 'DASHBOARDS',
    children: [
      {
        id: 'dashboards.analytics',
        title: 'Analytics',
        type: 'item',
        icon: 'heroicons-outline:chart-pie',
        url: '/dashboards/analytics',
      }
    ],
  },
  {
    id: 'page-users',
    title: 'User Manage',
    translate: 'LANG_USER_MANAGE',
    type: 'item',
    icon: 'heroicons-outline:star',
    url: 'admin/users',
  },
];

export default navigationConfig;
