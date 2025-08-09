const nodemailer = require("nodemailer");
const { registerEmailTemplate } = require("../template/Email.tamplate");
require("dotenv").config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: process.env.NODE_ENV === "production" ? false : true,
  auth: {
    user: "saimunhasanrifat14@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmail = async (to, subject, template) => {
  const mailOptions = {
    from: "saimunhasanrifat14@gmail.com",
    to,
    subject,
    html: template,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email sending failed", error);
  }
};

module.exports = sendEmail;
