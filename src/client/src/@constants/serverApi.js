export default {
  SERVER_URL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : "http://192.168.0.250:8080",
};
