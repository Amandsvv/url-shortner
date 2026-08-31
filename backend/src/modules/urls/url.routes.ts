import { Router } from "express";

import { createUrlByUserController, createUrlController } from "./url.controller.js";
import { verifyJWT } from "../../utils/verifyJWT.js";

const urlRouter = Router();

urlRouter.post("/", createUrlController);
urlRouter.post("/user", verifyJWT, createUrlByUserController);

export default urlRouter;