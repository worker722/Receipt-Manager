import FuseUtils from "@fuse/utils";
import FuseLoading from "@fuse/core/FuseLoading";
import { Navigate } from "react-router-dom";
import settingsConfig from "app/configs/settingsConfig";

// Page Configs
import Error404Page from "../main/404/Error404Page";
import DashboardConfigs from "../main/dashboards/config.dashboards";
import AdminConfigs from "../main/admin/config.admin";
import StaffConfigs from "../main/staff/config.staff";
import AuthConfigs from "../main/auth/config.auth";

const routeConfigs = [
  ...DashboardConfigs,
  ...AdminConfigs,
  ...StaffConfigs,
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
