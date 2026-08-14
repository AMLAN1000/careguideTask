"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/User/user.route");
const auth_routes_1 = require("../modules/Auth/auth.routes");
const note_routes_1 = require("../modules/Note/note.routes");
const post_routes_1 = require("../modules/Post/post.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/users",
        route: user_route_1.userRoutes,
    },
    {
        path: "/notes",
        route: note_routes_1.noteRoutes,
    },
    {
        path: "/posts",
        route: post_routes_1.postRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
