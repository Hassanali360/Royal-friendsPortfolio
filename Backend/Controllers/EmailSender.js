const nodemailer = require("nodemailer");
const validator = require("validator");
const sanitizeHtml = require("sanitize-html");
require("dotenv").config();

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("Error: EMAIL_USER and EMAIL_PASS must be set in .env");
  throw new Error("Missing email configuration");
}
if (!process.env.OWNER_EMAIL) {
  console.error("Error: OWNER_EMAIL must be set in .env");
  throw new Error("Missing owner email configuration");
}

// Email configuration using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter readiness
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error.message);
  } else {
    console.log("Email transporter is ready");
  }
});

const sendLoginAlertEmail = async ({ name, email, loginTime, signupTime, sendToAdmin = false }) => {
  // Validate inputs
  if (!name || !email) {
    throw new Error("Name and email are required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  if (loginTime && !validator.isISO8601(loginTime)) {
    throw new Error("Invalid loginTime format");
  }
  if (signupTime && !validator.isISO8601(signupTime)) {
    throw new Error("Invalid signupTime format");
  }

  // Sanitize inputs to prevent HTML injection
  const sanitizedName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
  const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

  // Determine if it's a signup or login event
  const isSignup = !!signupTime;
  const time = isSignup ? signupTime : loginTime;
  const eventType = isSignup ? "Signup" : "Login";

  // User email options
  const userSubject = process.env.LOGIN_ALERT_SUBJECT || `Your ${eventType} Details`;
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: sanitizedEmail, // Send to user's email
    subject: userSubject,
    html: `
      <h2>${eventType} Confirmation</h2>
      <p><strong>Name:</strong> ${sanitizedName}</p>
      <p><strong>Email:</strong> ${sanitizedEmail}</p>
      <p><strong>${eventType} Time:</strong> ${time ? new Date(time).toLocaleString() : "Not provided"}</p>
    `,
  };

  // Admin email options (using OWNER_EMAIL)
  const adminMailOptions = sendToAdmin
    ? {
        from: process.env.EMAIL_USER,
        to: process.env.OWNER_EMAIL,
        subject: `New User ${eventType} Alert`,
        html: `
          <h2>New User ${eventType}</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>${eventType} Time:</strong> ${time ? new Date(time).toLocaleString() : "Not provided"}</p>
        `,
      }
    : null;

  // Send emails
  try {
    // Send to user
    await transporter.sendMail(userMailOptions);
    console.log(`${eventType} alert email sent to user ${sanitizedEmail}`, {
      timestamp: new Date().toISOString(),
      userEmail: sanitizedEmail,
    });

    // Send to admin if requested
    if (sendToAdmin) {
      await transporter.sendMail(adminMailOptions);
      console.log(`${eventType} alert email sent to admin ${process.env.OWNER_EMAIL}`, {
        timestamp: new Date().toISOString(),
        adminEmail: process.env.OWNER_EMAIL,
      });
    }
  } catch (error) {
    console.error("Email sending error:", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = sendLoginAlertEmail;