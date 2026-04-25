import express from "express"
import { user } from "../models/user.js"
import { notify } from "../models/notification.js"
import { post } from "../models/post.js"
import islogged from "../middlewares/islogged.js"
import mongoose from "mongoose";
import { upload, uploaddpToCloudinary } from "../config/cloudinary.js"
const router = express.Router()

router.get("/home", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })
    let notifydata = await notify.countDocuments({ to: userdata._id, isread: false })
    const userd = await user.findById(userdata._id);
    const interestedTags = userdata.interestedTags;
    const alluserspost = await post.aggregate([
        {
            $addFields: {
                matchScore: {
                    $size: {
                        $ifNull: [
                            { $setIntersection: ["$tags", interestedTags] }, // variable use karo
                            []
                        ]
                    }
                }
            }
        },

        { $sort: { matchScore: -1, createdAt: -1 } },

        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ]);
    res.render("home", { alluserspost, userdata, notifydata });
})


router.get("/profile", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email }).populate("posts").populate("follower").populate("following")
    let notifydata = await notify.countDocuments({ to: userdata._id, isread: false })
    res.render("profile", { userdata, notifydata })
})

router.get("/Vclips", islogged, async (req, res) => {
    let alluserspost = await post.find().populate("user").then(posts => posts.filter(post => post.user !== null));
    let userdata = await user.findOne({ email: req.datahere.email })
    let notifydata = await notify.countDocuments({ to: userdata._id, isread: false })
    res.render("vclips", { alluserspost, userdata, notifydata });
})

router.post("/follow/:followeduserid", islogged, async (req, res) => {
    try {
        let mydata = await user.findOne({ email: req.datahere.email })
        let otheruserdata = await user.findOne({ _id: req.params.followeduserid });
        if (otheruserdata.follower.includes(mydata._id)) {
            await user.updateOne({ _id: otheruserdata._id }, { $pull: { follower: mydata._id } })
            await user.updateOne({ _id: mydata._id }, { $pull: { following: otheruserdata._id } })
            await notify.findOneAndDelete({ to: otheruserdata._id, from: mydata._id, type: "follow" })
            return res.json({ following: false })
        }
        else {
            await notify.create({
                to: otheruserdata._id,
                from: mydata._id,
                isread: false,
                type: "follow"
            })
            otheruserdata.follower.push(mydata._id);
            mydata.following.push(otheruserdata._id)
            await otheruserdata.save()
            await mydata.save()
            return res.json({ following: true })
        }
    } catch (error) {
        return res.status(500).json({ message: error })
    }
})

router.post("/removeFollower/:removerid", islogged, async (req, res) => {
    try {
        let mydata = await user.findOne({ email: req.datahere.email });
        let removeuser = await user.findOne({ _id: req.params.removerid })
        mydata.follower.splice(mydata.follower.indexOf(removeuser._id), 1)
        removeuser.following.splice(removeuser.following.indexOf(mydata._id), 1)
        await mydata.save()
        await removeuser.save()
        res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.post("/removeFollowing/:removerid", islogged, async (req, res) => {
    try {
        let removeuser = await user.findOne({ _id: req.params.removerid });
        let mydata = await user.findOne({ email: req.datahere.email });
        mydata.following.splice(mydata.following.indexOf(removeuser._id), 1)
        removeuser.follower.splice(removeuser.follower.indexOf(mydata._id), 1)
        await mydata.save();
        await removeuser.save();
        res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.post("/update", upload.single("dp"), islogged, async (req, res) => {
    try {
        console.log("req.body:", req.body)
        console.log("req.file:", req.file)
        console.log("req.datahere:", req.datahere)

        let userdata = await user.findOne({ username: req.datahere.username })
        const { updescription, upname, upusername } = req.body;
        let updatedata = {};
        if (upname && upname.trim() !== "") updatedata.name = upname.trim();
        if (updescription && updescription.trim() !== "") updatedata.bio = updescription.trim();
        if (upusername && upusername.trim() !== "") updatedata.username = upusername.trim();
        let image_url = null
        if (req.file) {
            const result = await uploaddpToCloudinary(req.file.buffer)
            console.log("reslut", result);
            image_url = result.secure_url;
        }
        else {
            image_url = "image/default.png"
        }
        if (req.file) {
            updatedata.image = image_url;
        }
        console.log("updatedata:", updatedata)  // yeh bhi lagao
        let update = await user.findOneAndUpdate(
            { email: req.datahere.email },
            updatedata,
            { returnDocument: 'after' }
        )
        res.redirect("/profile")
    } catch (error) {
        res.send(error.message)
    }

})

router.get("/profiles/edit", islogged, async (req, res) => {
    let error = req.flash("error")
    let userdata = await user.findOne({ email: req.datahere.email })
    let notifydata = await notify.countDocuments({ to: userdata._id, isread: false })
    res.render("profileedit", { error, userdata, notifydata })
})

router.get("/profile/viewpost/:postid", islogged, async (req, res) => {
    let myposts = await post.findOne({ _id: req.params.postid }).populate("user")
    let userdata = await user.findOne({ email: req.datahere.email })
    let notifydata = await notify.countDocuments({to:userdata._id,isread:false})
    res.render("yourposts", { myposts, userdata ,notifydata})
})

router.get("/home/:id", islogged, async (req, res) => {
    let userdata = await user.findOne({ _id: req.params.id }).populate("posts")
    let mydata = await user.findOne({ email: req.datahere.email })
    if (req.params.id == mydata._id) {
        return res.redirect("/profile")
    }
    let notifydata = await notify.countDocuments({to:mydata._id,isread:false})
    res.render("otheruserprofile.ejs", { userdata,notifydata,mydata})
})

router.get("/Search", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })
    let notifydata = await notify.countDocuments({to:userdata._id,isread:false})
    res.render("search", { userdata ,notifydata})
})
router.get("/search/user",islogged, async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === "") {
        return res.json([])
    }

    const finduser = await user.find({
        username: { $regex: new RegExp(query, 'i') }
    }).select('username image _id').limit(8)

    res.json(finduser)
})

router.get("/Search/:id", islogged, async (req, res) => {
    let userdata = await user.findOne({ _id: req.params.id }).populate("posts")
    let mydata = await user.findOne({ email: req.datahere.email })
    if (userdata._id.toString() === mydata._id.toString()) {
        return res.redirect("/profile")
    }
    let notifydata = await notify.countDocuments({to:mydata._id,isread:false})
    res.render("searcheduser", { userdata ,notifydata ,mydata})
})

export default router;