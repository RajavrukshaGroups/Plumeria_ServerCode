import mongoose from "mongoose";

const roomAvailabilitySchema = new mongoose.Schema({
  roomType: String, // Stores availability for a specific day
  date: Date,
  availableRooms: Number, // Number of available rooms for the day
});

const RoomAvailability = mongoose.model(
  "RoomAvailability",
  roomAvailabilitySchema
);
export default RoomAvailability;
