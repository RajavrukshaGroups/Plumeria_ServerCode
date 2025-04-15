
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomType: { type: String,},
  maxRoomsAvailable: { type: Number },
  checkIn: { type: String },
  checkOut: { type: String },
  images: [{ type: String }],
  capacity: {
    maxPersons: { type: Number },
    maxAdults: { type: Number },
    maxChildren: { type: Number },
  },
  roomInfo: {
    description: { type: String,  },
    bed: { type: String },
    amenities: [{ type: String }],
    terms: [{ type: String }],
  },
  plans: {
    type: [
      {
        name: { type: String },
        twoGuestsWithGST: { type: Number },
        twoGuestsWithoutGST: { type: Number },
        extraAdultWithGST: { type: Number },
        extraAdultWithoutGST: { type: Number },
        complimentary: [{ type: String }],
        services: {
          WiFi: { type: Boolean },
          breakfast: { type: Boolean },
          spa: { type: Boolean },
          taxesIncluded: { type: Boolean },
        },
      },
    ],

  },
}, {
  timestamps: true,
});

// export default mongoose.models.Room || mongoose.model("Room", roomSchema); 
const Room = mongoose.model("Roomadmin", roomSchema);
export default Room;
// export default mongoose.models.Room || mongoose.model("Rooms", roomSchema);

// const planSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   twoGuestsWithGST: { type: Number, required: true },
//   twoGuestsWithoutGST: { type: Number, required: true },
//   extraAdultWithGST: { type: Number, required: true },
//   extraAdultWithoutGST: { type: Number, required: true },
//   // complimentary: { type: String, required: true },
//   complimentary: [{ type: String, required: true }],
//   services: {
//     WiFi: { type: Boolean, required: true },
//     breakfast: { type: Boolean, required: true },
//     spa: { type: Boolean, required: true },
//     taxesIncluded: { type: Boolean, required: true },
//   },
// }, { _id: false });

// const roomSchema = new mongoose.Schema({
//   roomType: { type: String, required: true },
//   maxRoomsAvailable: { type: Number, required: true },
//   checkIn: { type: String, required: true },
//   checkOut: { type: String, required: true },
//   images: [{ type: String, required: true }],
//   capacity: {
//     maxPersons: { type: Number, required: true },
//     maxAdults: { type: Number, required: true },
//     maxChildren: { type: Number, required: true },
//   },
//   roomInfo: {
//     description: { type: String, required: true },
//     bed: { type: String, required: true },
//     amenities: [{ type: String, required: true }],
//     terms: [{ type: String, required: true }],
//   },
//   plans: { type: [planSchema], required: true },
// }, {
//   timestamps: true,
// });

// export default mongoose.models.Room || mongoose.model("Rooms", roomSchema);


// // // models/Room.js
// // import mongoose from 'mongoose';

// // const planSchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   twoGuestsWithGST: { type: Number, required: true },
// //   twoGuestsWithoutGST: { type: Number, required: true },
// //   extraAdultWithGST: { type: Number, required: true },
// //   extraAdultWithoutGST: { type: Number, required: true },
// //   complimentary: { type: String, required: true }, // or you can use an array if needed
// //   services: {
// //     WiFi: { type: Boolean, required: true },
// //     breakfast: { type: Boolean, required: true },
// //     spa: { type: Boolean, required: true },
// //     taxesIncluded: { type: Boolean, required: true },
// //   },
// // }, { _id: false });

// // const roomSchema = new mongoose.Schema({
// //   roomType: { type: String, required: true },
// //   maxRoomsAvailable: { type: Number, required: true },
// //   checkIn: { type: String, required: true },
// //   checkOut: { type: String, required: true },
// //   images: [{ type: String, required: true }], // URLs from Cloudinary
// //   capacity: {
// //     maxPersons: { type: Number, required: true },
// //     maxAdults: { type: Number, required: true },
// //     maxChildren: { type: Number, required: true },
// //   },
// //   roomInfo: {
// //     description: { type: String, required: true },
// //     bed: { type: String, required: true },
// //   },
// //   terms: { type: String, required: true },
// //   amenities: [{ type: String, required: true }],
// //   plans: { type: [planSchema], required: true },
// // }, {
// //   timestamps: true,
// // });

// // export default mongoose.models.Room || mongoose.model("Room", roomSchema);

// // models/Room.js
