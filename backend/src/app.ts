import express from "express";
import { globalErrorHandler } from "./middleware/eror.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware.js";
import helmet from "helmet";
import cors  from "cors";
import { env } from "./config/env.js"
import cookieParser from "cookie-parser"

const app = express();

app.use(helmet());

app.use(cors({
    origin: env.FRONTEND_URL,
    methods : ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials : true
}));

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware)
app.use(cookieParser());

app.use(express.json({ limit : "10kb" }));

app.get('/health', (req,res)=>{
    return res.status(200).json({success : 'ok', message : "Server is running"});
});


import UrlRoutes  from "./modules/urls/url.routes.js";
import redirectRouter from "./modules/redirect/redirect.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import userUrlRouter from "./modules/users/urls/user-urls.route.js";


app.get("/hit", (req, res) =>{
    throw new Error("Hiited")
})
app.use("/api/v1/urls", UrlRoutes);
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userUrlRouter)
app.use("/", redirectRouter);
app.use(globalErrorHandler);
export default app;