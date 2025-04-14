
// const Admin = require('../models/adminModel')
import Admin from "../../Models/adminModels/adminMode.js";
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

const getRoomsData =async(req,res)=>{
 try {
    const rooms = await Room.find();
    console.log(rooms,'fetched rooms data');
    
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error });
  }
};

const saveRoomData =async (req,res)=>{
    try {
        console.log(req.body.roomData, 'Incoming data');
        console.log(JSON.parse(req.body.roomData,'ddddddddd'), 'Parsed data');
        
        // Parse the JSON string from the form data
        const roomData = JSON.parse(req.body.roomData);
        // console.log(req.files, 'req.files');
        
    
        // Upload images (if any) using express-fileupload.
        // req.files.images may be a single file or an array.
        // let imageUrls = [];
        // if (req.files && req.files.images) {
        //   let images = req.files.images;
        //   if (!Array.isArray(images)) {
        //     images = [images];
        //   }
        //   // Loop over each file and upload it to Cloudinary
        //   for (const image of images) {
        //     const result = await cloudinary.uploader.upload(image.tempFilePath, {
        //       folder: "room-images",
        //     });
        //     imageUrls.push(result.secure_url);
        //     console.log(result.secure_url, 'Image URL');
        //   }
        // }
        // // Set the Cloudinary image URLs in the roomData object
        // roomData.images = imageUrls;
        // console.log(roomData.images, 'roomData images');
        
     
        // Create and save the Room document in MongoDB
        const newRoom = new RoomModel(roomData);
        await newRoom.save();
    
        res.status(201).json({ message: "Room created successfully", room: newRoom });
      } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ error: "Internal server error" });
      }
}

export default{
    Adminlogin,
    getRoomsData,
    saveRoomData
}
