import "dotenv/config";
import express from "express";
import mongoose, { mongo } from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bookingStatusCheck from "./routes/bookingStatusRoutes.js";
import adminroutes from "./routes/adminRoutes/adminRoutes.js"

const app = express();
// dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     // origin: "https://plumeriaresort.in",
//     // origin: "http://localhost:5173",
//     origin: "*",
//     credentials: true,
//   })
// );

// const allowedOrigins = ["https://plumeriaresort.in", "https://test.plumeriaresort.in"];
const allowedOrigins = ["http://localhost:5173", "https://test.plumeriaresort.in"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and authentication headers
}));

app.use(express.static("public"));

// const MONGO_URL = "mongodb://127.0.0.1:27017/Plumeria";
const MONGO_URL =
  "mongodb+srv://enquiry:cWkQzlp42pu8yu7N@cluster0.r9w8y.mongodb.net";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

app.use("/", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/payments", paymentRoutes);
app.use("/bookings", bookingStatusCheck);
app.use("/admin",adminroutes)
// app.get("/", (req, res) => {
//   res.send("server is working");
// });

// const PORT=6000;
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
