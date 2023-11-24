import FuseLoading from "@fuse/core/FuseLoading";
import FuseUtils from "@fuse/utils";
import settingsConfig from "app/configs/settingsConfig";
import { Navigate } from "react-router-dom";

// Page Configs
import Error404Page from "../main/404/Error404Page";
import AdminConfigs from "../main/admin/config.admin";
import AuthConfigs from "../main/auth/config.auth";
import DashboardConfigs from "../main/dashboards/config.dashboards";
import StaffConfigs from "../main/staff/config.staff";
import UserConfigs from "../main/user/config.user";

const routeConfigs = [
  ...DashboardConfigs,
  ...AdminConfigs,
  ...StaffConfigs,
  ...UserConfigs,
  ...AuthConfigs,
];

const routes = [
  ...FuseUtils.generateRoutesFromConfigs(
    routeConfigs,
    settingsConfig.defaultAuth
  ),
  {
    path: "/",
    element: <Navigate to="/dashboards" />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: "loading",
    element: <FuseLoading />,
  },
  {
    path: "404",
    element: <Error404Page />,
  },
  {
    path: "*",
    element: <Navigate to="404" />,
  },
];

export default routes;
