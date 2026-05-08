import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import parser from "cookie-parser"
import { user } from "../models/user.js"
import resend from "../config/nodemailer.js"
const router = express.Router()

router.get("/", (req, res) => {
    if (req.cookies.token) {
        res.redirect("/profile")
    }
    else {
        let error = req.flash("error")
        res.render("index", { error });
    }
})

router.get("/mobilestart", (req, res) => {
    res.render("mobileindex")
})

router.get("/create", (req, res) => {
    let exists = req.flash("exists")
    let Infoerror = req.flash("Infoerror")
    res.render("create", { exists, Infoerror })
})

router.post("/sendotp", async (req, res) => {
    try {
        const { name, username, password, email } = req.body;
        const emailExists = await user.findOne({ email });
        if (emailExists) return res.status(400).json({ message: "Email already registered" });

        const usernameExists = await user.findOne({ username });
        if (usernameExists) return res.status(400).json({ message: "Username already taken" });

        if (!email || !username || !name || !password) {
            return res.status(400).json({ message: "Please Fill All Data" })
        }
        const usernameregex = /^[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/
        if (!usernameregex.test(username)) {
            return res.status(400).json({ message: "Invalid Username Syntax" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        req.session.otpdata = {
            name,
            username,
            password,
            email,
            otp,
            expiry: Date.now() + 2 * 60 * 1000
        };
        const mailsend = {
            from: "official@connectorapp.online",
            to: email,
            subject: "Verify Connector Account",
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:white;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:21px;padding:40px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h2 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">Connector - Verify Your Account</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <p style="color:#a1a1aa;margin:0;font-size:14px;">Use the code below to verify your email address</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 0;">
              <table cellpadding="0" cellspacing="0" style="border:1px solid #4d4d54;border-radius:12px;padding:24px 48px;">
                <tr>
                  <td align="center">
                    <h1 style="color:#ffffff;margin:0;font-size:42px;font-weight:700;letter-spacing:10px;">${otp}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:16px;">
              <p style="color:#71717a;margin:0;font-size:13px;">This code expires in <span style="color:#ffffff;">2 minutes</span></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;border-top:1px solid #27272a;margin-top:32px;">
              <p style="color:#52525b;margin:0;font-size:12px;">If you didn't request this, ignore this email.</p>
              <p style="color:#52525b;margin:4px 0 0;font-size:12px;">© 2026 Connector</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
        }
        await resend.emails.send(mailsend)
        res.json({ message: "Otp Send Successfully" });
    } catch (error) {
        res.json({ message: error.message });
    }
})

router.post("/create/account", async (req, res) => {
    try {
        const { otp } = req.body;
        const sessionData = req.session.otpdata;
        if (!sessionData) {
            return res.status(400).json({ message: "Session expired, resend OTP" });
        }
        if (Date.now() > sessionData.expiry) {
            delete req.session.otpdata;
            return res.status(400).json({ message: "OTP expired, resend OTP" });
        }
        if (otp.toString() !== sessionData.otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        let hash = await bcrypt.hash(sessionData.password, 10)
        const createuser = new user({
            email: sessionData.email,
            name: sessionData.name,
            username: sessionData.username,
            password: hash,
            image: "/images/default.png",
        })
        await createuser.save()
        let token = jwt.sign({ email: sessionData.email, id: createuser._id }, process.env.JWT_KEY, { expiresIn: "30d" })
        res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" })
        res.json({ message: "Account created" });
    } catch (error) {
        if(error.name === "ValidationError"){
            return res.status(400).json({ message: "Max Characters Not Allowed" });
        }
        return res.status(500).json({ message: "Account not created" });
    }

})

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        let finduser = await user.findOne({ username: req.body.username })
        if (finduser) {
            let checkpassword = await bcrypt.compare(req.body.password, finduser.password)
            if (checkpassword) {
                let token = jwt.sign({ email: finduser.email, id: finduser._id }, process.env.JWT_KEY, { expiresIn: "30d" })
                res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" })
                res.json({ success: true });
            }
            else {
                res.json({ success: false, message: "Username Or Password Is Wrong" });
            }
        }
        else {
            res.json({ success: false, message: "Username Or Password Is Wrong" });
        }
    } catch (error) {
        res.send("Something Went Wrong")
    }

})

router.get("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/")
})

router.post("/logout", (req, res) => {
    res.redirect("/logout")
})


export default router;