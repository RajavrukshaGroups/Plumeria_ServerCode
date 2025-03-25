import express from "express";
import RoomController from "../controller/roomController.js";

const router = express.Router();

router.get("/", RoomController.roomDetails);
router.post("/check-availability", RoomController.checkRoomsAvailability);
router.post("/booking", RoomController.createBooking);

export default router;
