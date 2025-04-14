// models/Room.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  twoGuestsWithGST: { type: Number, default: 0 },
  twoGuestsWithoutGST: { type: Number, default: 0 },
  extraAdultWithGST: { type: Number, default: 0 },
  extraAdultWithoutGST: { type: Number, default: 0 },
  complimentary: { type: String, default: '' }, // Optional: could be an array if needed
  services: [{ type: String }]
}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  bedType: { type: String },
  terms: { type: String },
  amenities: [{ type: String }],
  plans: [planSchema],
  images: [{ type: String }], // Cloudinary URLs
  maxRooms: { type: Number }, // You mentioned it in form, include it
  roomInfo: { type: String }, // Optional room description/info
}, {
  timestamps: true
});

export default mongoose.models.Room || mongoose.model("Room", roomSchema);



// // models/Room.js
// import mongoose from 'mongoose';

// const planSchema = new mongoose.Schema({
//   name: String,
//   twoGuestsWithGST: Number,
//   twoGuestsWithoutGST: Number,
//   extraAdultWithGST: Number,
//   extraAdultWithoutGST: Number,
//   complimentary: String,
//   services: [String],
// });

// const roomSchema = new mongoose.Schema({
//   roomType: { type: String, required: true },
//   bedType: { type: String },
//   terms: { type: String },
//   amenities: [String],
//   plans: [planSchema],
//   images: [String], // Array of image URLs or paths
// }, {
//   timestamps: true
// });

// export default mongoose.models.Room || mongoose.model("RoomSchema", roomSchema);
