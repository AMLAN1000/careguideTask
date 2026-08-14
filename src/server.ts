import { Server } from "http";
import mongoose from "mongoose";
import config from "./config";
import app from "./app";

let server: Server;

async function main() {
  try {
    if (!config.database_url) {
      console.error("DATABASE_URL is not defined in environment variables!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.database_url);
    console.log("Database connected successfully!");

    server = app.listen(config.port, () => {
      console.log(`Server is listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed gracefully!");
        process.exit(0);
      });
    } else {
      process.exit(1);
    }
  };

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception: ", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection: ", error);
    exitHandler();
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Shutting down gracefully...");
    exitHandler();
  });

  process.on("SIGINT", () => {
    console.log("SIGINT signal received. Shutting down gracefully...");
    exitHandler();
  });
}

main();
