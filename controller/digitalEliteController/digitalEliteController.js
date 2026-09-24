import nodemailer from "nodemailer";
const sendMail = async (req, res) => {
  const { name, phone, email, company, website, service } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({
      success: false,
      message: "name,phone and email are required fields",
    });
  }

  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be exactly 10 digits",
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.DIGITAL_ELITE_MAIL,
        pass: process.env.DIGITAL_ELITE_PASS,
      },
    });

    const mailOptions = {
      from: `"DIGITAL ELITE CONTACT" <${process.env.DIGITAL_ELITE_MAIL}`,
      to: process.env.DIGITAL_ELITE_MAIL,
      subject: `New Contact Request from ${name}`,
      html: `
      <h3>New Contact Form Submission(Web Lead)</h3>
      <p><strong>Name:</strong>${name}</p>
      <p><strong>Email:</strong>${email}</p>
      <p><strong>Phone:</strong>${phone}</p>
      <p><strong>Company:</strong>${company || "N/A"}</p>
      <p><strong>Website:</strong>${website || "N/A"}</p>
      <p><strong>Preferred Service:</strong> ${service}</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Mail sent successfully" });
  } catch (err) {
    console.error("email error:", err);
    res.status(500).json({ success: false, message: "Mail sending failed" });
  }
};

// -------------------------
// Send Enquiry
// -------------------------


const sendEnquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "name, email and phone are required fields",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Landing Page Enquiry" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAILS,
      subject: "New Landing Page Enquiry",

      html: `
        <h2>New Enquiry Received</h2>

        <table border="1" cellpadding="10" cellspacing="0">
          <tr>
            <td><strong>Name</strong></td>
            <td>${name}</td>
          </tr>

          <tr>
            <td><strong>Email</strong></td>
            <td>${email}</td>
          </tr>

          <tr>
            <td><strong>Phone</strong></td>
            <td>${phone}</td>
          </tr>

          <tr>
            <td><strong>Message</strong></td>
            <td>${message || "N/A"}</td>
          </tr>
        </table>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("Email sending error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to send email",
    });
  }
};


export default {
  sendMail,sendEnquiry
};
