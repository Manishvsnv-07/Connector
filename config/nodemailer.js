import dotenv, { populate } from "dotenv"
dotenv.config();
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS
    },
    family: 4
})

export default transporter;