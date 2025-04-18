// const Admin = require('../models/adminModel')
import { count, error } from "console";
import Admin from "../../Models/adminModels/adminMode.js";
import RoomAvailability from "../../Models/RoomAvailability.js";
import Booking from "../../Models/Booking.js";

const Adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body, "Incoming data");

    // Check if admin already exists
    const AdminEmail = await Admin.findOne({ email });
    console.log(AdminEmail, "Admin already exists");

    if (!AdminEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email ID" });
    } else if (password !== AdminEmail.password) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }
    console.log("login successful");

    res.status(200).json({ success: true, message: "Login Success" });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const GetRoomsData = async (req, res) => {
  const { roomType, date } = req.query;
  console.log("roomType", roomType);
  console.log("date", date);
  if (!roomType || !date) {
    return res.status(400).json({ message: "roomtype and date are required" });
  }
  try {
    const availability = await RoomAvailability.findOne({
      roomType,
      date: new Date(date),
    });
    if (!availability) {
      return res.json({ availableRooms: 0 });
    }
    res.status(200).json({ availableRooms: availability.availableRooms });
    console.log("available rooms", availability);
  } catch (error) {
    console.error("error fetching availability:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const RoomUpdatesAvailability = async (req, res) => {
  const { roomType, date, availableRooms } = req.body;

  if (!roomType || !date || availableRooms === undefined) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    const updated = await RoomAvailability.findOneAndUpdate(
      { roomType, date: new Date(date) },
      { availableRooms },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res
      .status(200)
      .json({ message: "Availability updated", data: updated });
  } catch (err) {
    console.error("error updating availability", err);
    res.status(500).json({ message: "server error" });
  }
};

const ListRoomsAvailable = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const [data, totalCount] = await Promise.all([
      RoomAvailability.find().sort({ date: 1 }).skip(skip).limit(limit),
      RoomAvailability.countDocuments(),
    ]);
    // const allAvailability = await RoomAvailability.find().sort({ date: 1 });
    res.status(200).json({ data, totalCount });
  } catch (error) {
    console.error("error fetching room availability", error);
    res.status(500).json({ message: "failed to fetch the room availability." });
  }
};

const GetEditRoomsInfo = async (req, res) => {
  try {
    const item = await RoomAvailability.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "not found" });
    res.status(200).json({ data: item });
  } catch (err) {
    console.error("failed to get rooms availability", err);
    res.status(500).json({ message: "server error" });
  }
};

const DeleteRoomAvailabilityData = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteRoom = await RoomAvailability.findByIdAndDelete(id);
    if (!deleteRoom) {
      return res.status(404).json({ message: "Room availability not found." });
    }
    return res
      .status(200)
      .json({ message: "Room availability deleted successfully." });
  } catch (err) {
    console.error("error deleting the room availability", err);
    return res.status(500).json({ message: "server error" });
  }
};

const FilterRoomAvailability = async (req, res) => {
  try {
    const { date, roomType } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Please select a date to filter." });
    }

    console.log("date", date);
    console.log("roomType", roomType);

    let filter = {};
    if (date) filter.date = new Date(date);
    if (roomType && roomType !== "All Types") {
      filter.roomType = roomType;
    }

    const filteredRooms = await RoomAvailability.find(filter).sort({ date: 1 });
    res.status(200).json(filteredRooms);
    console.log("filteredRooms", filteredRooms);
  } catch (error) {
    console.error("Error filtering room availability:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const ViewAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.status(200).json({
      success: true,
      message: "All booking fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "failed to fetch details",
      error: error.message,
    });
  }
};

const GetBookingsByCheckInDate = async (req, res) => {
  try {
    const { checkInDate } = req.query;

    if (!checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Check-in date is required",
      });
    }

    const bookings = await Booking.find({ checkInDate });
    res.status(200).json({
      success: true,
      message: `Bookings found for check-in date:${checkInDate}`,
      data: bookings,
    });
  } catch (error) {
    console.error("error fetching bookings by check-in date:", error);
    res.status(500).json({
      success: false,
      message: "server error fetching bookings",
      error: error.message,
    });
  }
};

const CollectUniqueCheckInDate = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const results = await Booking.aggregate([
      {
        $group: {
          _id: "$checkInDate",
        },
      },
      {
        $addFields: {
          parsedDate: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $substr: ["$_id", 6, 4] }, // YYYY
                  "-",
                  { $substr: ["$_id", 3, 2] }, // MM
                  "-",
                  { $substr: ["$_id", 0, 2] }, // DD
                ],
              },
              format: "%Y-%m-%d",
            },
          },
        },
      },
      { $sort: { parsedDate: 1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            { $project: { _id: 0, checkInDate: "$_id" } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const uniqueDates = results[0].data;
    const total = results[0].totalCount[0]?.count || 0;

    console.log("uniquedates", uniqueDates);

    res.status(200).json({
      success: true,
      data: uniqueDates,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("error collecting check-in dates", error);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// Example: Express route handler
// const FilterUniqueCheckInDate = async (req, res) => {
//   const { date, page = 1, limit = 5 } = req.query;
//   const skip = (page - 1) * limit;

//   try {
//     const matchStage = date
//       ? {
//           $match: {
//             checkInDate: new Date(date), // ensure date format is correct
//           },
//         }
//       : { $match: {} };

//     const aggregation = [
//       matchStage,
//       {
//         $group: {
//           _id: "$checkInDate",
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: -1 } },
//       { $skip: parseInt(skip) },
//       { $limit: parseInt(limit) },
//     ];

//     const countAggregation = [
//       matchStage,
//       {
//         $group: {
//           _id: "$checkInDate",
//         },
//       },
//       {
//         $count: "total",
//       },
//     ];

//     const [results, countResult] = await Promise.all([
//       Booking.aggregate(aggregation),
//       Booking.aggregate(countAggregation),
//     ]);

//     const total = countResult[0]?.total || 0;

//     res.json({ data: results, total });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch unique check-in dates" });
//   }
// };

export default {
  Adminlogin,
  RoomUpdatesAvailability,
  GetRoomsData,
  ListRoomsAvailable,
  GetEditRoomsInfo,
  DeleteRoomAvailabilityData,
  FilterRoomAvailability,
  ViewAllBookings,
  GetBookingsByCheckInDate,
  CollectUniqueCheckInDate,
//   FilterUniqueCheckInDate,
};
