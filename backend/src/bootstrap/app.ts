import cors from "cors";
import express from "express";
import { router } from "./router";
import { errorMiddleware } from "../shared/http/error.middleware";
import { requestLogMiddleware } from "../shared/http/requestLog.middleware";

export const app = express();

app.use(requestLogMiddleware);

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use(errorMiddleware);
