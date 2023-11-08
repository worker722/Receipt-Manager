import FuseUtils from "@fuse/utils/FuseUtils";
import axios from "axios";
import jwtDecode from "jwt-decode";
import jwtServiceConfig from "./jwtServiceConfig";
import { LocalStorageKey } from "@constants";

/* eslint-disable camelcase */

class JwtService extends FuseUtils.EventEmitter {
  init() {
    this.setInterceptors();
    this.handleAuthentication();
  }

  setInterceptors = () => {
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (err) => {
        return new Promise((resolve, reject) => {
          if (err?.code == "ERR_NETWORK") {
            this.emit("onError", "Network failed. Please check your network!");
            resolve();
          } else if (
            err?.response?.status === 401 &&
            err?.config &&
            !err?.config?.__isRetryRequest
          ) {
            // if you ever get an unauthorized response, logout the user
            this.emit("onAutoLogout", "Invalid access_token");
            this.setSession(null);
            reject();
          } else {
            reject();
          }
        });
      }
    );
  };

  handleAuthentication = () => {
    const access_token = this.getAccessToken();

    if (!access_token) {
      this.emit("onNoAccessToken");

      return;
    }

    if (this.isAuthTokenValid(access_token)) {
      this.setSession(access_token);
      this.emit("onAutoLogin", true);
    } else {
      this.setSession(null);
      this.emit(
        "onAutoLogout",
        "Your credential was expired. Please login again."
      );
    }
  };

  createUser = (data) => {
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.signUp, data)
        .then((response) => {
          if (response?.status == 200) {
            const { data = {}, status = 200 } = response?.data;
            if (status == 200) {
              const { user, access_token } = data;
              this.setSession(access_token);
              resolve(user);
              this.emit("onLogin", user);
            } else {
              reject(response?.data);
            }
          } else {
            reject();
          }
        })
        .catch((_error) =>
          reject({ message: "Something went wrong. Please try again." })
        );
    });
  };

  signInWithEmailAndPassword = (email, password, remember = false) => {
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.signIn, {
          data: {
            email,
            password,
          },
        })
        .then((response) => {
          if (response?.status == 200) {
            const { data = {}, status = 200 } = response.data;
            if (status == 200) {
              const { user, access_token } = data;
              if (remember) this.setSession(access_token);
              resolve(user);
              this.emit("onLogin", user);
            } else {
              reject(response.data);
            }
          } else {
            reject();
          }
        });
    });
  };

  signInWithToken = () => {
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.accessToken, {
          data: {
            access_token: this.getAccessToken(),
          },
        })
        .then((response) => {
          if (response?.data?.data?.user) {
            const { access_token = {}, user = {} } = response.data.data;
            this.setSession(access_token);
            resolve(user);
          } else {
            this.logout();
            reject(new Error("Failed to login."));
          }
        })
        .catch((error) => {
          this.logout();
          reject(new Error("Failed to login."));
        });
    });
  };

  updateUserData = (user) => {
    return new Promise((resolve, reject) => {
      resolve(user);
    });
  };

  setSession = (access_token) => {
    if (access_token) {
      localStorage.setItem(LocalStorageKey.REMEMBER_USER_TOKEN, access_token);
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    } else {
      localStorage.removeItem(LocalStorageKey.REMEMBER_USER_TOKEN);
      delete axios.defaults.headers.common.Authorization;
    }
  };

  logout = () => {
    this.setSession(null);
    this.emit("onLogout", "Logged out");
  };

  isAuthTokenValid = (access_token) => {
    if (!access_token) {
      return false;
    }
    const decoded = jwtDecode(access_token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn("access token expired");
      return false;
    }

    return true;
  };

  getAccessToken = () => {
    return window.localStorage.getItem(LocalStorageKey.REMEMBER_USER_TOKEN);
  };
}

const instance = new JwtService();

export default instance;
