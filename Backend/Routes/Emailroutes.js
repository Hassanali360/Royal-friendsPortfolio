// routes/emailRoutes.js or inside app.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// ✅ Email config (Use Gmail App Password — NOT your actual Gmail password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hassanali009945@gmail.com", // your gmail
    pass: "",    // Use Gmail App Password from security settings
  },
});

router.post("/api/send-login-alert", async (req, res) => {
  const { fullname, email, loginTime } = req.body;  // Use the fields as per the updated schema

  const mailOptions = {
    from: "hassanali009945@gmail.com",
    to: "hassanmunir083@gmail.com", // 🔁 Change this to the actual owner's email
    subject: "🚨 User Logged In",
    html: `
      <h2>New User Login</h2>
      <p><strong>Name:</strong> ${fullname}</p> <!-- Updated to fullname -->
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Login Time:</strong> ${loginTime}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Email failed to send." });
  }
});

module.exports = router;
