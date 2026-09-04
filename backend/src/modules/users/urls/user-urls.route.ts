import { Router } from "express";
import { verifyJWT } from "../../../utils/verifyJWT.js";
import { deleteUserUrlController, getUserStatsController, getUserUrls, getUserUrlsById, updateUserUrlController } from "./user-urls.controller.js";

const userUrlRouter = Router();

userUrlRouter.get("/urls", verifyJWT, getUserUrls);
userUrlRouter.get("/urls/:id", verifyJWT, getUserUrlsById);
userUrlRouter.get("/stats", verifyJWT, getUserStatsController);
userUrlRouter.patch("/urls/:id", verifyJWT, updateUserUrlController);
userUrlRouter.delete("/urls/:id", verifyJWT, deleteUserUrlController);

export default userUrlRouter;