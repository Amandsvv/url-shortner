import { Router } from "express";

import { createUrlController } from "./url.controller.js";

const urlRouter = Router();

urlRouter.post("/",createUrlController);

export default urlRouter;