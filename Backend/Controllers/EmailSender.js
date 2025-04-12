// routes/emailRoutes.js or inside app.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hassanali009945@gmail.com",         // Replace with your email
    pass: "ghfhwfeyoorlnbwp",           // Use Gmail App Password (not your actual password)
  },
});

router.post("/api/send-login-alert", async (req, res) => {
  const { name, email, role, loginTime } = req.body;

  const mailOptions = {
    from: "yourgmail@gmail.com",
    to: "owneremail@example.com", // Send alert to this email
    subject: "🚨 User Logged In",
    html: `
      <h2>New User Login</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${role}</p>
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
