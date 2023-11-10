import DashboardsConfigs from './dashboards/config.dashboards';

// Managements
import UsersPageConfig from './users/config.page';
import RolesPageConfig from './roles/config.page';

const AdminConfigs = [
    ...DashboardsConfigs,

    // Managements
    UsersPageConfig,
    RolesPageConfig,
]

export default AdminConfigs;