import { Router } from "express";

import { createUrlByUserController, createUrlController } from "./url.controller.js";
import { verifyJWT } from "../../utils/verifyJWT.js";
import { guestCreateRateLimit } from "../../middleware/rate-limit.middleware.js";

const urlRouter = Router();

urlRouter.post("/",guestCreateRateLimit, createUrlController);
urlRouter.post("/user", verifyJWT, createUrlByUserController);

export default urlRouter;