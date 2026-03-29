import { app } from "./app";
import { env } from "../shared/config/env";

app.listen(env.port, () => {
  console.log(`Server Running on http://localhost:${env.port}`);
});
