import express from 'express';
import adminController from '../../controller/adminController/adminController.js';
import Room from '../../Models/Room.js';
const router =express.Router()

router.post('/adminLogin',adminController.Adminlogin)
// Get all rooms
router.get("/roomsdata",adminController.getRoomsData)
router.post('/rooms',adminController.saveRoomData)
router.put("/editSaveroom/:id",adminController.editSaveroom)
router.delete("/deleteroom/:id", adminController.deleteRoomById);

router.post("/addRoomtype",adminController.addRoomType);
router.get("/getRoomtype",adminController.getRoomType);
router.put("/updateroomtype/:id",adminController.updateRoomType);
router.delete("/deleteroomtype/:id",adminController.deleteRoomType);

  export default router
  
