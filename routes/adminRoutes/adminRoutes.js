import express from 'express';
import adminController from '../../controller/adminController/adminController.js';
import Room from '../../Models/Room.js';
const router =express.Router()

router.post('/adminLogin',adminController.Adminlogin)
// Get all rooms
  router.post("/addRoomtype",adminController.addRoomType);
  router.get("/roomsdata",adminController.getRoomsData)
  router.post('/rooms',adminController.saveRoomData)
  router.put("/editSaveroom/:id",adminController.editSaveroom)
  router.delete("/deleteroom/:id", adminController.deleteRoomById);
  
  router.get('/getRoomtypes', async (req, res) => {
    try {
      const roomTypes = await RoomType.find();
      res.status(200).json(roomTypes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  export default router
  
