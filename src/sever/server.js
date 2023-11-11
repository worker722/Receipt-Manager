const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const routes = require("./src/routes");

const app = express();

dotenv.config();

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Hello from backend");
});

// Setting up server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server is up and running on port: ${PORT}`)
);

// Connecting to mongoDB
const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL;

connectDB()
  .then((res) => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error(err);
  });

async function connectDB() {
  await mongoose.connect(DB_CONNECTION_URL);
}
