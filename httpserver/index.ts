import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { signup, signin } from "./auth";
import orderRoutes from "./routes/orders";
import marketRoutes from "./routes/market";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Auth
app.post("/signup", signup);
app.post("/signin", signin);

// Protected routes
app.use("/orders", orderRoutes);
app.use("/market", marketRoutes);

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
