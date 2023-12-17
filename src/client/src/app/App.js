import { Server } from "@constants";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import BrowserRouter from "@fuse/core/BrowserRouter";
import FuseAuthorization from "@fuse/core/FuseAuthorization";
import FuseLayout from "@fuse/core/FuseLayout";
import FuseTheme from "@fuse/core/FuseTheme";
import settingsConfig from "app/configs/settingsConfig";
import { selectMainTheme } from "app/store/fuse/settingsSlice";
import { selectCurrentLanguageDirection } from "app/store/i18nSlice";
import { selectUser } from "app/store/userSlice";
import themeLayouts from "app/theme-layouts/themeLayouts";
import axios from "axios";
import { SnackbarProvider } from "notistack";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import rtlPlugin from "stylis-plugin-rtl";
import { AuthProvider } from "./auth/AuthContext";
import withAppProviders from "./withAppProviders";

// Set Axios http default
axios.defaults.baseURL = Server.SERVER_URL;
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers.common["Content-Type"] = "multipart/form-data";

const emotionCacheOptions = {
  rtl: {
    key: "muirtl",
    stylisPlugins: [rtlPlugin],
    insertionPoint: document.getElementById("emotion-insertion-point"),
  },
  ltr: {
    key: "muiltr",
    stylisPlugins: [],
    insertionPoint: document.getElementById("emotion-insertion-point"),
  },
};

function App() {
  const user = useSelector(selectUser);
  const langDirection = useSelector(selectCurrentLanguageDirection);
  const mainTheme = useSelector(selectMainTheme);

  // Ntfy push notification via websocket
  // const socket = new WebSocket(
  //   "wss://ntfy.sh/online-receipt-manager-notification-topic/ws"
  // );

  // socket.onopen = function () {
  //   console.log("Socket opened");
  // };

  // socket.onmessage = function (event) {
  //   console.log(`On message : ${event.data}`);
  //   const data = JSON.parse(event.data);
  //   if (data?.message) {
  //     alert(data.message);
  //   }
  // };

  // socket.onclose = function (event) {
  //   console.log("Socket closed");
  // };

  // socket.onerror = function (error) {
  //   console.log(`Error : ${error.message}`);
  // };

  useEffect(() => {
    // askNotificationPermission();
  }, []);

  const askNotificationPermission = () => {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          createNotificationSubscription();
        }
      });
    }
  };

  async function createNotificationSubscription() {
    //wait for service worker installation to be ready
    const serviceWorker = await navigator.serviceWorker.ready;
    // subscribe and return the subscription
    return await serviceWorker.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        "BBFzxIarfFTI3DYQX36XWU-V0ciXml6VWiEXMSbwvs53zMtJFfjRd44cl4veprgbxmB4Ji24FgYWoI1cmMdPP7M",
    });
  }

  return (
    <CacheProvider value={createCache(emotionCacheOptions[langDirection])}>
      <FuseTheme theme={mainTheme} direction={langDirection}>
        <AuthProvider>
          <BrowserRouter>
            <FuseAuthorization
              userRole={user.role}
              loginRedirectUrl={settingsConfig.loginRedirectUrl}
            >
              <SnackbarProvider
                maxSnack={5}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                classes={{
                  containerRoot:
                    "bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99",
                }}
              >
                <FuseLayout layouts={themeLayouts} />
              </SnackbarProvider>
            </FuseAuthorization>
          </BrowserRouter>
        </AuthProvider>
      </FuseTheme>
    </CacheProvider>
  );
}

export default withAppProviders(App)();
