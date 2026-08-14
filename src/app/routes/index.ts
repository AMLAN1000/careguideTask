import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { noteRoutes } from "../modules/Note/note.routes";
import { postRoutes } from "../modules/Post/post.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/notes",
    route: noteRoutes,
  },
  {
    path: "/posts",
    route: postRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;