import "dotenv/config";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// const plumeriaContactMail = async (req, res) => {
//   console.log("req_body", req.body);
//   const {
//     name,
//     lastName = "",
//     email,
//     notes,
//     phone,
//     isModal,
//     project,
//   } = req.body;

//   const recipientEmail = process.env.RECIPIENT_EMAIL;
//   const recipientPass = process.env.RECIPIENT_PASS;
//   // const recipientEmail = 'enquiry@rajavrukshagroup.in';
//   // const recipientPass = 'fqygkkfrzraxxcol';
//   console.log("RECIPIENT_EMAIL:", process.env.RECIPIENT_EMAIL);
//   console.log("RECIPIENT_PASS:", process.env.RECIPIENT_PASS);

//   if (!recipientEmail || !recipientPass) {
//     throw new Error(
//       "Email credentials (RECIPIENT_EMAIL and RECIPIENT_PASS) are not properly configured in the environment."
//     );
//   }

//   if (!name || typeof name !== "string" || name.trim().length === 0) {
//     return res.status(400).json({ error: "Invalid or missing name." });
//   }
//   if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     return res.status(400).json({ error: "Invalid email address." });
//   }

//   if (!isModal) {
//     if (
//       !lastName ||
//       typeof lastName !== "string" ||
//       lastName.trim().length === 0
//     ) {
//       return res.status(400).json({ error: "Invalid or missing last name." });
//     }
//     if (!phone || !/^\d{10}$/.test(phone)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid phone number. Must be 10 digits." });
//     }
//     if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
//       return res.status(400).json({ error: "Message cannot be empty." });
//     }
//   }

//   let emailContact;
//   if (!!isModal) {
//     emailContact = `
//          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//             <h2 style="color: #333;">New Brochure Download For ${project}</h2>
//             <p><strong>Name:</strong> ${name}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Contact Number:</strong> ${phone}</p>
//         </div>
//       `;
//   } else {
//     emailContact = `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//             <h2 style="color: #333;">New Contact Request for Plumeria Resort</h2>
//             <p><strong>Name:</strong> ${name} ${lastName}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Phone No:</strong> ${phone}</p>
//             <h3 style="color: #555;">Message:</h3>
//             <p style="border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9;">${notes}</p>
//         </div>
//       `;
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: recipientEmail,
//       pass: recipientPass,
//     },
//   });

//   const mailOptions = {
//     from: "your-email@gmail.com",
//     to: recipientEmail,
//     subject: `New Contact Request from ${name}${
//       lastName ? " " + lastName : ""
//     }`,
//     replyTo: email,
//     html: emailContact,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Message sent successfully!" });
//     console.log("message sent successfully!");
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).send("Error sending message. Please try again later.");
//   }
// };

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
  } = req.body;

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
  }

  let emailContact;
  if (!!isModal) {
    emailContact = `
         <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">New Brochure Download For ${project}</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contact Number:</strong> ${phone}</p>
        </div>
      `;
  } else {
    emailContact = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">New Contact Request for Plumeria Resort</h2>
            <p><strong>Name:</strong> ${name} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone No:</strong> ${phone}</p>
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

  // const mailOptions = {
  //   from: "your-email@gmail.com",
  //   to: recipientEmail,
  //   subject: `New Contact Request from ${name}${
  //     lastName ? " " + lastName : ""
  //   }`,
  //   replyTo: email,
  //   html: emailContact,
  // };

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
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending message. Please try again later.");
  }
};

export default { plumeriaContactMail };
