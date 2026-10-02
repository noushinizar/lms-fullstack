import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ EMAIL CONFIGURATION ERROR:");
    console.error(error);
  } else {
    console.log("✅ EMAIL SERVER IS READY");
  }
});

export default transporter;