const mongoose = require("mongoose");
const UserRole = require("../userRoleModel");

// Connecting to mongoDB
const DB_CONNECTION_URL = "mongodb://localhost:27017/db_receipt";

connectDB();

async function connectDB() {
  try {
    await mongoose.connect(DB_CONNECTION_URL);

    setTimeout(async () => {
      await UserRole.deleteMany({});

      UserRole.create({
        name: "admin",
        value: 0,
        redirect_url: "dashboards/analytics",
      });

      UserRole.create({
        name: "staff",
        value: 1,
        redirect_url: "/",
      });

      UserRole.create({
        name: "user",
        value: 2,
        redirect_url: "/",
      });

      mongoose.connection.close();
    }, 1000);
  } catch (error) {
    console.log("seed error: ", error);
  }
}
