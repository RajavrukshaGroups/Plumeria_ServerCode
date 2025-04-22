import express from 'express';
import adminController from '../../controller/adminController/adminController.js';
import Room from '../../Models/Room.js';
const router =express.Router()

router.post("/adminLogin", adminController.Adminlogin);
// router.get("/roomsavailable", adminController.GetRoomsData);
router.get("/checkroomsavailability", adminController.GetRoomsData);
router.put("/updateroomsavailability", adminController.RoomUpdatesAvailability);
router.get("/listroomsavailable", adminController.ListRoomsAvailable);
router.get("/editroomsinfo/:id", adminController.GetEditRoomsInfo);
router.delete(
  "/deleteroomavailability/:id",
  adminController.DeleteRoomAvailabilityData
);
router.get("/filterroomavailability", adminController.FilterRoomAvailability);
router.get("/viewallbookings", adminController.ViewAllBookings);
router.get(
  "/bookings/by-checkin-date",
  adminController.GetBookingsByCheckInDate
);
router.get(
  "/bookings/unique-checkin-dates",
  adminController.CollectUniqueCheckInDate
);
router.get(
  "/bookings/filter-checkin-dates",
  adminController.CollectAllUniqueCheckInDates
);
router.get("/roomsdata",adminController.getRoomsData)
router.post('/rooms',adminController.saveRoomData)
router.put("/editSaveroom/:id",adminController.editSaveroom)
router.delete("/deleteroom/:id", adminController.deleteRoomById);
router.post("/addRoomtype",adminController.addRoomType);
router.get("/getRoomtype",adminController.getRoomType);
router.put("/updateroomtype/:id",adminController.updateRoomType);
router.delete("/deleteroomtype/:id",adminController.deleteRoomType);
router.get("/checkroomsavailability", adminController.GetRoomsData);

  export default router
  
