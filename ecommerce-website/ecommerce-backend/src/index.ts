import "reflect-metadata";
import { app } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
