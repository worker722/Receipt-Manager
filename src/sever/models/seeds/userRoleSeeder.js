const mongoose = require("mongoose");
const Role = require("../roleModel");

// Connecting to mongoDB
const DB_CONNECTION_URL = "mongodb://localhost:27017/db_receipt";

connectDB();

async function connectDB() {
  try {
    await mongoose.connect(DB_CONNECTION_URL);

    setTimeout(async () => {
      await Role.deleteMany({});

      Role.create({
        name: "admin",
        value: 0,
        redirect_url: "dashboards/analytics",
      });

      Role.create({
        name: "staff",
        value: 1,
        redirect_url: "/",
      });

      Role.create({
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
