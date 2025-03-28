import express from "express";
import paymentController from "../controller/paymentController.js";

const router = express.Router();

router.post("/create-order", paymentController.createPayment);
router.post("/verify-payment", paymentController.verifyPayment);

export default router;
