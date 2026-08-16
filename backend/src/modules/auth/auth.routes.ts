import { Router } from "express";
import { googleCallbackController, googleController } from "./auth.controller.js";

const authRouter = Router();

authRouter.get("/google", googleController);
authRouter.get("/google/callback", googleCallbackController);

export default authRouter;