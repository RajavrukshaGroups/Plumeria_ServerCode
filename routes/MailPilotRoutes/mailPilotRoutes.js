import express from "express";
import mailPilotController from "../../controller/mailPilotController/mailPilot.js";

const router = express.Router();

router.post("/sendBulkMails", mailPilotController.sendBulkMail);
router.post("/sendgrid-webhook", mailPilotController.updateStatus);

export default router;
