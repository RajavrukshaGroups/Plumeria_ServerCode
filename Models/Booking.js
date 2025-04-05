import { strict } from "assert";
import mongoose from "mongoose";
// const bookingSchema = new mongoose.Schema({
//   bookingId: Number,
//   customerName: String,
//   contactInfo: {
//     email: String,
//     phone: String,
//   },
//   roomNumber: String,
//   checkInDate: String,
//   checkOutDate: String,
//   checkInTime: String,
//   checkOutTime: String,
//   totalRooms: Number,
//   roomTypes: [String],
//   totalGuests: [
//     {
//       roomType: String,
//       persons: Number,
//       adult: Number,
//       children: Number,
//     },
//   ],
//   totalCost: Number,
//   bookingStatus: String,
//   payment: {
//     method: String,
//     amountPaid: Number,
//     balanceDue: Number,
//   },
//   assignedStaff: String,
//   specialRequests: [String],
//   discount: {
//     code: String,
//     amount: Number,
//   },
// });

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
  // checkInDate: Date,
  // checkOutDate: Date,
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
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
