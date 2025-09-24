import dotenv from "dotenv";
dotenv.config();
console.log("Starting server process...");

import express from "express";
import cors from "cors";
import routes from "./src/routes/index.js";
import connectDB from "./src/config/db.js";

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api", routes);

export default app;
