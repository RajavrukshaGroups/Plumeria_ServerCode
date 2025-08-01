import { strict } from "assert";
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  customerName: String,
  domainName: String,
  contactInfo: {
    email: String,
    phone: String,
    customerAddress: String,
    customerPanNumber: String,
    customerAadharNumber: String,
    gstNumber: String,
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
      planName: String,
      duration: Number,
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
