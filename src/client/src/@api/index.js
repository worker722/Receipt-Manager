import axios from "axios";
import useLocalStorage from "@fuse/hooks/useLocalStorage";
import FuseUtils from "@fuse/utils";
import { LocalStorageKey } from "@constants";

const API = axios.create({ baseURL: process.env.REACT_APP_API });

API.interceptors.request.use((req) => {
  const [remember_token] = useLocalStorage(
    LocalStorageKey.REMEMBER_USER_TOKEN,
    null
  );
  if (FuseUtils.isEmpty(remember_token)) {
    req.headers.authorization = `Bearer ${remember_token}`;
  }

  return req;
});
