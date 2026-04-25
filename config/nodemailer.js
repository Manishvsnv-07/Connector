import dotenv, { populate } from "dotenv"
dotenv.config();
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS
    }
})

export default transporter;