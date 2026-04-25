import express from "express"
import { post } from "../models/post.js"
import { user } from "../models/user.js"
import { notify } from "../models/notification.js"
import islogged from "../middlewares/islogged.js"
const router = express.Router()

router.get("/Notify", islogged, async (req, res) => {
    try {
        let userdata = await user.findOne({ email: req.datahere.email })
        let notification = await notify.find({ to: userdata._id })
            .populate({
                path: "from",
                select: "username image"
            })
            .populate({
                path: "postid",
            })
        await notify.updateMany({ to: userdata._id, isread: false }, { isread: true })
        res.render("notify", { userdata,notification })
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }

})

export default router;