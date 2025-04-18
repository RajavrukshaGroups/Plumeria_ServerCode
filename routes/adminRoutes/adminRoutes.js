import express from "express";
import adminController from "../../controller/adminController/adminController.js";
const router = express.Router();

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

export default router;
