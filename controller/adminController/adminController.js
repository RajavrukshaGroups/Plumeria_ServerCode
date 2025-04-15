
// const Admin = require('../models/adminModel')
// import Admin from "../../Models/adminModels/adminMode.js";
import RoomModel from "../../Models/adminModels/roomModels.js";
import cloudinary from "../../utils/cloudinary.js";
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
    console.log(parsedData.plans, 'Parse data');
    
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
    
    const formattedPlans = parsedData.plans.map(plan => ({
      name: plan.name,
      twoGuestsWithGST: plan.price.twoGuests.withGST,
      twoGuestsWithoutGST: plan.price.twoGuests.withoutGST,
      extraAdultWithGST: plan.price.extraAdult.withGST,
      extraAdultWithoutGST: plan.price.extraAdult.withoutGST,
      complimentary: plan.complimentary.map(c => c.trim()),
      services: formatServices(plan.services),
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
    console.log(rooms,'fetched rooms data');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error });
  }
};

export default{
  Adminlogin,
  getRoomsData,
  saveRoomData
}
