// controllers/bookingController.js
import Booking from "../Models/Booking.js";
import mongoose from "mongoose";

const checkBookingStatus = async (req, res) => {
  const { bookingId } = req.params;

  console.log("bookings id", bookingId);

  //   if (!mongoose.Types.ObjectId.isValid(bookingId)) {
  //     return res.status(400).json({ message: "Invalid Booking ID." });
  //   }

  try {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    return res.status(200).json({ booking });
  } catch (error) {
    console.error("Error checking booking status:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export default { checkBookingStatus };
