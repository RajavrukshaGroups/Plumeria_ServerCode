
// const Admin = require('../models/adminModel')
// import Admin from "../../Models/adminModels/adminMode.js";
import RoomModel from "../../Models/adminModels/roomModels.js";
import cloudinary from "../../utils/cloudinary.js";
import RoomType from '../../Models/adminModels/roomType.js';

import { count, error } from "console";
import Admin from "../../Models/adminModels/adminMode.js";
import RoomAvailability from "../../Models/RoomAvailability.js";
import Booking from "../../Models/Booking.js";

const Adminlogin =async(req,res)=>{
    try {
        const { email, password } = req.body;
        console.log(req.body, 'Incoming data');
        // Check if admin already exists
        const AdminEmail = await Admin.findOne({ email });
        console.log(AdminEmail, 'Admin already exists');
        if (!AdminEmail) {
            return res.status(400).json({ success: false, message: "Incorrect email ID" });
        }else if(password!==AdminEmail.password){
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }
        console.log('login successful');
        res.status(200).json({success:true,message:"Login Success"})

    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


const saveRoomData = async (req, res) => {
  try {
    console.log(req.body.roomData, 'Incoming data');
    const parsedData = JSON.parse(req.body.roomData);
    console.log(parsedData.roomInfo.bed, 'Parse data');


    let imageUrls = [];
    if (req.files?.images) {
      let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: "room-images",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const formatServices = (servicesArray) => ({
      WiFi: servicesArray.includes("WiFi"),
      breakfast: servicesArray.includes("Breakfast"),
      spa: servicesArray.includes("Spa"),
      taxesIncluded: servicesArray.includes("Taxes Included"),
    });

    const formatMenuDetails = (menuString) => {
      if (!menuString || typeof menuString !== "string") {
        return {
          welcomeDrinks: [],
          breakFast: [],
          dinner: [],
          snacks: []
        };
      }

      const items = menuString.split(',').map(item => item.trim());
      return {
        welcomeDrinks: [],    // Can customize if you want to split
        breakFast: items,     // Put all in breakfast for now (or separate logic if needed)
        dinner: [],
        snacks: []
      };
    };

    const formattedPlans = parsedData.plans.map(plan => ({
      name: plan.name,
      price: {
        twoGuests: {
          withGst: plan.price.twoGuests.withGst,
          withoutGst: plan.price.twoGuests.withoutGst
        },
        extraAdult: {
          withGst: plan.price.extraAdult.withGst,
          withoutGst: plan.price.extraAdult.withoutGst
        }
      },
      complimentary: plan.complimentary.map(c => c.trim()).filter(c => c),
      services: formatServices(plan.services),
      menuDetails: plan.menuDetails
    }));

    const roomToSave = {
      roomType: parsedData.roomType,
      maxRoomsAvailable: parsedData.maxRoomsAvailable,
      checkIn: parsedData.checkIn,
      checkOut: parsedData.checkOut,
      images: imageUrls,
      capacity: parsedData.capacity,
      roomInfo: {
        description: parsedData.roomInfo.description,
        bed: parsedData.roomInfo.bed,
        amenities: parsedData.amenities || [],
        terms: parsedData.terms ? parsedData.terms.split(',').map(term => term.trim()) : [],
      },
      plans: formattedPlans,
    };

    const newRoom = new RoomModel(roomToSave);
    const savedRoom = await newRoom.save();

    res.status(201).json({ message: "Room created successfully", room: savedRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRoomsData =async(req,res)=>{
  try {
 
    const rooms = await RoomModel.find();
   //  console.log(rooms,'fetched rooms data');
 
    console.log('Fetching rooms data',rooms[0].plans, 'WiFi service status');
 
     res.status(200).json(rooms);
   } catch (error) {
     res.status(500).json({ message: "Error fetching rooms", error });
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



const editSaveroom = async (req, res) => {
  try {
    const parsedData = JSON.parse(req.body.roomData);
    const roomId = req.params.id; // Make sure this exists in the incoming data
    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required for update." });
    }
    let imageUrls = [];
    if (req.files?.images) {
      let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: "room-images",
        });
        imageUrls.push(result.secure_url);
      }
    }
    const formatServices = (servicesArray) => {
      const list = Array.isArray(servicesArray) ? servicesArray : [];
      return {
        WiFi: list.includes("WiFi"),
        breakfast: list.includes("breakfast"),
        spa: list.includes("spa"),
        taxesIncluded: list.includes("taxesIncluded"),
      };
    };
    const formattedPlans = parsedData.plans.map(plan => ({
      name: plan.name,
      price: {
        twoGuests: {
          withGst: plan.price.twoGuests.withGst,
          withoutGst: plan.price.twoGuests.withoutGst
        },
        extraAdult: {
          withGst: plan.price.extraAdult.withGst,
          withoutGst: plan.price.extraAdult.withoutGst
        }
      },
      complimentary: plan.complimentary.map(c => c.trim()).filter(c => c),
      services: formatServices(plan.services),
      menuDetails: plan.menuDetails
    }));
    const updatedRoom = {
      roomType: parsedData.roomType,
      maxRoomsAvailable: parsedData.maxRoomsAvailable,
      checkIn: parsedData.checkIn,
      checkOut: parsedData.checkOut,
      ...(imageUrls.length > 0 && { images: imageUrls }), // Only update if new images are uploaded
      capacity: parsedData.capacity,
      roomInfo: {
        description: parsedData.roomInfo.description,
        bed: parsedData.roomInfo.bed,
        amenities: parsedData.amenities || [],
        terms: Array.isArray(parsedData.terms) ? parsedData.terms.map(term => term.trim()) : [],
      },
      plans: formattedPlans,
    };
    const savedRoom = await RoomModel.findByIdAndUpdate(roomId, updatedRoom, { new: true });
    if (!savedRoom) {
      return res.status(404).json({ error: "Room not found." });
    }
    res.status(200).json({ message: "Room updated successfully", room: savedRoom });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// controllers/roomController.js
export const deleteRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const deletedRoom = await RoomModel.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json({ message: "Room deleted successfully", deletedRoom });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addRoomType =async(req,res)=>{
  try {
    const { name } = req.body;
    console.log(req.body, 'Incoming data');
    
    const newType = new RoomType({ name });
    await newType.save();
    res.status(201).json(newType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }

}
  // Get all room types
const getRoomType =async(req,res)=>{
  try {
    console.log('Fetching room types');
    const roomTypes = await RoomType.find();
    console.log(roomTypes, 'Fetched room types');
    res.status(200).json(roomTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const updateRoomType = async (req, res) => {
  try {
    console.log('Updating room type');
    
    const { id } = req.params;
    const { name } = req.body;

    const updatedRoom = await RoomType.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Return the updated document
    );
    

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room type not found." });
    }
    console.log('Updated room:', updatedRoom);
    res.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoom = await RoomType.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room type not found." });
    }

    res.json({ message: "Room type deleted successfully." });
  } catch (error) {
    console.error("Error deleting room type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
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

const CollectAllUniqueCheckInDates = async (req, res) => {
  try {
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
        $project: {
          _id: 0,
          checkInDate: "$_id",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching all unique check-in dates", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export default{
  Adminlogin,
  GetRoomsData,
  saveRoomData,
  editSaveroom,
  deleteRoomById,
  addRoomType,
  getRoomType,
  updateRoomType,
  deleteRoomType,
  RoomUpdatesAvailability,
  ListRoomsAvailable,
  GetEditRoomsInfo,
  DeleteRoomAvailabilityData,
  FilterRoomAvailability,
  ViewAllBookings,
  GetBookingsByCheckInDate,
  CollectUniqueCheckInDate,
  CollectAllUniqueCheckInDates,
  getRoomsData
}
