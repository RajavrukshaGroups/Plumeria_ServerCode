import express from "express";
import BookingStatusController from "../controller/checkBookingStatusController.js";

const router = express.Router();

router.get(
  "/check-status/:bookingId",
  BookingStatusController.checkBookingStatus
);

export default router;
