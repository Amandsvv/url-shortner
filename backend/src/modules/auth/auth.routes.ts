import { Router } from "express";
import { googleCallbackController, googleController, refreshTokensController, getCurrentUserController, logoutController } from "./auth.controller.js";
import { verifyJWT } from "../../utils/verifyJWT.js";

const authRouter = Router();

authRouter.get("/google", googleController);
authRouter.get("/google/callback", googleCallbackController);
authRouter.post("/refresh", refreshTokensController);
authRouter.get("/me", verifyJWT, getCurrentUserController);
authRouter.post("/logout", verifyJWT, logoutController)
export default authRouter;