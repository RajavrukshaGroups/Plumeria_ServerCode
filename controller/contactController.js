import "dotenv/config";
import { google } from "googleapis";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const plumeriaContactMail = async (req, res) => {
  console.log("req_body", req.body);
  const {
    name,
    lastName = "",
    email,
    notes,
    phone,
    isModal,
    project,
    city,
  } = req.body;
  const fullName = `${name} ${lastName}`.trim();

  console.log("RECIPIENT_EMAIL:", process.env.RECIPIENT_EMAIL);
  console.log("RECIPIENT_PASS:", process.env.RECIPIENT_PASS);

  const recipientEmail = process.env.PLUMERIA_RESORT_MAIL;
  const recipientPass = process.env.PLUMERIA_RESORT_PASS;
  if (!recipientEmail || !recipientPass) {
    throw new Error(
      "Email credentials (RECIPIENT_EMAIL and RECIPIENT_PASS) are not properly configured in the environment."
    );
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Invalid or missing name." });
  }
  if (!city || typeof city !== "string" || city.trim().length === 0) {
    return res.status(400).json({ error: "Invalid or missing city." });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  if (!isModal) {
    if (
      !lastName ||
      typeof lastName !== "string" ||
      lastName.trim().length === 0
    ) {
      return res.status(400).json({ error: "Invalid or missing last name." });
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ error: "Invalid phone number. Must be 10 digits." });
    }
    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    if (!city || typeof city !== "string" || city.trim().length === 0) {
      return res.status(400).json({ error: "city cannot be empty." });
    }
  }

  let emailContact;
  if (!!isModal) {
    emailContact = `
         <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">New Brochure Download For ${project}</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contact Number:</strong> ${phone}</p>
            <p><strong>City:</strong> ${city}</p>

        </div>
      `;
  } else {
    emailContact = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">New Contact Request for Plumeria Resort</h2>
            <p><strong>Name:</strong> ${name} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone No:</strong> ${phone}</p>
            <p><strong>City:</strong> ${city}</p>
            <h3 style="color: #555;">Message:</h3>
            <p style="border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9;">${notes}</p>
        </div>
      `;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: recipientEmail,
      pass: recipientPass,
    },
  });

  const mailOptions = {
    from: `"Plumeria Resort" <${recipientEmail}>`,
    to: recipientEmail,
    subject: `New Contact Request from ${name}${
      lastName ? " " + lastName : ""
    }`,
    replyTo: email,
    html: emailContact,
  };

  try {
    await transporter.sendMail(mailOptions);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PLUMERIA_LEADS_UPDATE;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = meta.data.sheets.map((s) => s.properties.title);
    console.log("Tabs:", sheetTitles);

    // const sheetName = sheetTitles.find(
    //   (t) => t.trim().toLowerCase() === "september"
    // );

    // if (!sheetName) {
    //   throw new Error("September sheet not found");
    // }
    // const now = new Date().toLocaleDateString("en-IN", {
    //   timeZone: "Asia/Kolkata",
    // });

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const finalDate = formattedDate.replace(/\//g, "-");
    const currentMonthYear = now.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const sheetName = sheetTitles.find(
      (t) => t.trim().toLowerCase() === currentMonthYear.toLowerCase()
    );

    if (!sheetName) {
      throw new Error(`${currentMonthYear} sheet not found!`);
    }

    const newRow = [
      finalDate,
      "website",
      fullName,
      phone || "",
      email || "",
      city || "",
      "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] },
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending message. Please try again later.");
  }
};

export default { plumeriaContactMail };
