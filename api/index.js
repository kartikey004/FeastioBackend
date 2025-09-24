import dotenv from "dotenv";
dotenv.config();
console.log("Starting server process...");

import express from "express";
import cors from "cors";
import routes from "../src/routes/index.js";
import connectDB from "../src/config/db.js";

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
