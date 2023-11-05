import axios from "axios";
import FuseUtils from "@fuse/utils";
import { LocalStorageKey } from "@constants";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers.common["Content-Type"] =
  "application/x-www-form-urlencoded";

axios.interceptors.request.use((req) => {
  const remember_token = window.localStorage.getItem(
    LocalStorageKey.REMEMBER_USER_TOKEN
  );
  if (FuseUtils.isEmpty(remember_token)) {
    req.headers.authorization = `Bearer ${remember_token}`;
  }

  return req;
});
