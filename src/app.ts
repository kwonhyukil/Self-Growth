import express from "express";
import cors from "cors";
import { router } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
// import { errorMiddleware } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use(errorMiddleware);

// app.use(errorMiddleware);
