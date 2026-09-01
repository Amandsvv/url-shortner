import { Router } from "express";
import { verifyJWT } from "../../../utils/verifyJWT.js";
import { deleteUserUrlController, getUserUrls, getUserUrlsById, updateUserUrlController } from "./user-urls.controller.js";

const userUrlRouter = Router();

userUrlRouter.get("/urls", verifyJWT, getUserUrls);
userUrlRouter.get("/urls/:id", verifyJWT, getUserUrlsById);
userUrlRouter.patch("/urls/:id", verifyJWT, updateUserUrlController);
userUrlRouter.delete("/urls/:id", verifyJWT, deleteUserUrlController);

export default userUrlRouter;