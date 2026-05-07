import dotenv, { populate } from "dotenv"
dotenv.config();
import express from "express"
import parser from "cookie-parser"
import flash from "connect-flash"
import session from "express-session";

const app = express()
const port = process.env.PORT || 57911

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(parser())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}))
app.use(flash())

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import solanaRoutes from "./routes/solanaRoutes.js"
import notifyRoutes from "./routes/notifyRoutes.js" 
app.use("/",authRoutes);
app.use("/",userRoutes);
app.use("/",postRoutes)
app.use("/",solanaRoutes)
app.use("/",notifyRoutes)

app.use((err, req, res, next) => {
    if (err.message === "Videos Not Allowed As A Nft") {
        return res.status(400).json({ success: false, message: "Video As A NFT Not Allowed ✕" })
    }
    next(err)
})

app.get("/error",(req,res)=>{
    res.render("error")
})

app.listen(port, () => {
    console.log(`my port at ${port}`);
})