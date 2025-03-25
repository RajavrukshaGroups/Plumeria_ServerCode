import "dotenv/config";
import express from "express";
import mongoose, { mongo } from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

const app = express();
// dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    // origin: "https://plumeriaresort.in",
    // origin: "http://localhost:5173",
    origin: "*",
    credentials: true,
  })
);

app.use(express.static("public"));

const MONGO_URL = "mongodb://127.0.0.1:27017/Plumeria";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

app.use("/", userRoutes);
app.use("/rooms", roomRoutes);
// app.get("/", (req, res) => {
//   res.send("server is working");
// });

// const PORT=6000;
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
