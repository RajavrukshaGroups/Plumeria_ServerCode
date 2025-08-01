import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  // key_id: process.env.RAZORPAY_TEST_KEY_ID,
  // key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // Convert INR to paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const hmac = crypto.createHmac(
      "sha256",
      // process.env.RAZORPAY_TEST_KEY_SECRET
      process.env.RAZORPAY_KEY_SECRET
    );
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};

export default { createPayment, verifyPayment };
