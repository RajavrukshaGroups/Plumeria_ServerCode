import { strict } from "assert";
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  customerName: String,
  contactInfo: {
    email: String,
    phone: String,
  },
  checkInDate: String,
  checkOutDate: String,
  totalRooms: Number,
  roomTypes: [String],
  totalGuests: [
    {
      roomType: String,
      persons: Number,
      adult: Number,
      children: Number,
    },
  ],
  totalCost: Number,
  bookingStatus: String,
  payment: {
    method: String,
    amountPaid: Number,
    balanceDue: Number,
  },
  assignedStaff: String,
  specialRequests: [String],
  discount: {
    code: String,
    amount: Number,
  },
  invoicePdfUrl: String,
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
