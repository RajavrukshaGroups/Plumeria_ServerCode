import sgMail from "@sendgrid/mail";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const logToGoogleSheets = async ({ to, subject, status }) => {
  const auth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const values = to.map((email) => [
    email,
    subject,
    status,
    new Date().toISOString(),
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!A:D", // Adjust the range as needed
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
};

const sendBulkMail = async (req, res) => {
  const { subject, body, to } = req.body;

  const messages = to.map((email) => ({
    to: email,
    from: process.env.PLUMERIA_RESORT_MAIL,
    subject,
    html: body,
    trackingSettings: {
      clickTracking: { enable: true, enableText: true },
      openTracking: { enable: true },
    },
  }));

  try {
    await sgMail.send(messages, true); // true enables batch sending

    await logToGoogleSheets({
      to,
      subject,
      status: "Sent",
    });

    res.status(200).json({ success: true, message: "Emails sent" });
  } catch (error) {
    console.error(error.response?.body || error);
    res.status(500).json({ success: false, error: "Email sending failed" });
  }
};

const updateStatus = async (req, res) => {
  const events = req.body;

  if (!events || !Array.isArray(events)) {
    return res.status(400).send("Invalid events payload.");
  }

  try {
    for (const event of events) {
      const { email, event: eventType, subject } = event;

      if (!email || !eventType || !subject) {
        console.error("Missing fields in event:", event);
        continue; // Skip processing this event if essential data is missing
      }

      // Define the status based on the event type
      let status = "Sent"; // Default status
      if (eventType === "bounce" || eventType === "dropped") {
        status = "Invalid"; // Mark as invalid if email bounced or was dropped
        console.log(`Invalid email detected: ${email}`);
      } else if (eventType === "open") {
        status = "Opened"; // Mark as opened if the email was opened
      } else if (eventType === "click") {
        status = "Clicked"; // Mark as clicked if the email was clicked
      }

      // Log the event to Google Sheets
      await logToGoogleSheets({
        email,
        event: eventType,
        subject,
        status, // Add status here
      });

      // Optionally, handle specific event types differently
      if (eventType === "bounce") {
        console.log(`Bounce detected for ${email}`);
        // You can add further actions for bounce events (e.g., flagging the email)
      }
    }

    res.status(200).send("Events processed successfully.");
  } catch (error) {
    console.error("Error processing SendGrid events:", error);
    res.status(500).send("Failed to process events.");
  }
};

export default {
  sendBulkMail,
  updateStatus,
};
