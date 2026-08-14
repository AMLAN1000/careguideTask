"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const app_1 = __importDefault(require("./app"));
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!config_1.default.database_url) {
                console.error("DATABASE_URL is not defined in environment variables!");
                process.exit(1);
            }
            console.log("Connecting to MongoDB...");
            yield mongoose_1.default.connect(config_1.default.database_url);
            console.log("Database connected successfully!");
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(`Server is listening on port ${config_1.default.port}`);
            });
        }
        catch (error) {
            console.error("Failed to connect to database:", error);
            process.exit(1);
        }
        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    console.info("Server closed gracefully!");
                    process.exit(0);
                });
            }
            else {
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
    });
}
main();
