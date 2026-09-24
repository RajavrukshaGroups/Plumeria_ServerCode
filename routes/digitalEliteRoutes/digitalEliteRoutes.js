import express from "express";
import mailController from "../../controller/digitalEliteController/digitalEliteController.js";

const router = express.Router();

router.post("/sendMail", mailController.sendMail);
router.post("/enquiry", mailController.sendEnquiry)

export default router;
