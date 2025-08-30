import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import assetsRouter from "./routes/assets";
import candlesRouter from "./routes/candles";
import tradesRouter from "./routes/trades";
import userRouter from "./routes/user";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/assets", assetsRouter);
app.use("/api/v1/candles", candlesRouter);
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/user", userRouter);

app.listen(4000, () => {
  console.log("HTTP server listening on port 4000");
});
