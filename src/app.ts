import express from "express";
import cors from "cors";
import { router } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { requestLogMiddleware } from "./middlewares/requestLog.middleware";
// import { errorMiddleware } from "./middlewares/error.middleware";

export const app = express();

app.use(requestLogMiddleware);

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use(errorMiddleware);

// app.use(errorMiddleware);
