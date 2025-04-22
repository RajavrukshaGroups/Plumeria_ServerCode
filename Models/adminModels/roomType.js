// models/RoomType.js
import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const RoomType = mongoose.model("RoomType", roomTypeSchema);
export default RoomType;
