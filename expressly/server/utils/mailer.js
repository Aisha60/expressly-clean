import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
dotenv.config();

console.log(
    "EMAIL_USER:",
    process.env.EMAIL_USER,
    "EMAIL_PASS:",
    process.env.EMAIL_PASS
);

export const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Expressly OTP Code",
            text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`);
    } catch (err) {
        console.error("Error sending OTP email:", err);
        throw err;
    }
};