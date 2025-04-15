import mongoose from "mongoose";
import initData from "./data.js";
import bookingsData from "./bookingData.js";
import Listing from "../Models/Room.js";
import Booking from "../Models/Booking.js";
import RoomAvailability from "../Models/RoomAvailability.js";
import Room from "../Models/Room.js";
import roomAvailabilityData from "./roomAvailability.js";
import Admin from "../Models/adminModels/adminMode.js";
import adminLogs from "./adminLogs.js";

const mongo_URL = "mongodb://127.0.0.1:27017/Plumeria";
// const mongo_URL="mongodb+srv://enquiry:cWkQzlp42pu8yu7N@cluster0.r9w8y.mongodb.net"

const main = async () => {
  try {
    await mongoose.connect(mongo_URL);
    console.log("Connected to database");

    // await Listing.deleteMany({});
    // await Booking.deleteMany({});
    // await Listing.insertMany(initData);
    // await RoomAvailability.deleteMany({});
    await RoomAvailability.insertMany(roomAvailabilityData);
    // await Admin.insertMany(adminLogs);
    // await Booking.insertMany(bookingsData);
    console.log("Database initialized with room data.");

    mongoose.connection.close(); // Close DB connection
  } catch (error) {
    console.error("Error:", error);
    mongoose.connection.close();
  }
};

main();
