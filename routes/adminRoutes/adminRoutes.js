import express from 'express';
import adminController from '../../controller/adminController/adminController.js';
import Room from '../../Models/Room.js';
const router =express.Router()

router.post('/adminLogin',adminController.Adminlogin)
// Get all rooms

  router.get("/roomsdata",adminController.getRoomsData)

  router.post("/addrooms", async (req, res) => {
    console.log("Adding new room", req.body);
    try {
      const newRoom = new Room(req.body);
      await newRoom.save();
      res.status(201).json({ message: "Room added successfully", room: newRoom });
    } catch (error) {
      res.status(400).json({ message: "Error adding room", error });
    }
  });

  export default router
  
  router.post('/rooms',adminController.saveRoomData)
  // router.post("/admin/rooms", upload.array("images", 4), async (req, res) => {
  //   console.log("req.body:", req.body);   // Log roomData field
  //   console.log("req.files:", req.files); // Log images array
  //   // ... rest of your code
  // });