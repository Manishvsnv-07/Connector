import express from "express"
import { user } from "../models/user.js"
import { post } from "../models/post.js"
import { notify } from "../models/notification.js"
import islogged from "../middlewares/islogged.js"
import { uploadToCloudinary, uploadfield } from "../config/cloudinary.js"
const router = express.Router()


router.get("/post", islogged, async (req, res) => {
    let success = req.flash("success")
    let error = req.flash("error")
    let undefined = req.flash("Undefined")
    let userdata = await user.findOne({ email: req.datahere.email })
    let notifydata = await notify.countDocuments({ to: userdata._id, isread: false })
    res.render("upload", { success, error, userdata, undefined, notifydata });
})

router.post("/post", islogged, uploadfield, async (req, res) => {
    try {
        const mediaFile = req.files["media"]?.[0]
         console.log("step 2 - mediaFile:", mediaFile?.mimetype)
        const ThumbnailFile = req.files["thumbnail"]?.[0]
        const result = await uploadToCloudinary(mediaFile.buffer, mediaFile.mimetype)
        const result_thumb = ThumbnailFile ? await uploadToCloudinary(ThumbnailFile.buffer, ThumbnailFile.mimetype) : null;
        const isimage = mediaFile.mimetype.startsWith("image/");
        const isvideo = mediaFile.mimetype.startsWith("video/");
        const isthumbnail = ThumbnailFile?.mimetype.startsWith("image/") ?? false;
        const { description } = req.body;
        const isMintNft = req.body.isMintNft === "true"
        let userdata = await user.findOne({ email: req.datahere.email })
        const postcreate = new post({
            user: userdata._id,
            description,
            tags: JSON.parse(req.body.tgs || '[]'),
            image: isimage ? result.secure_url : "",
            videos: isvideo ? result.secure_url : "",
            thumbnail: isthumbnail ? result_thumb.secure_url : "",
            nftMint: null,
            nftMetaDataUri: null,
            isNftMint: false
        })
        await postcreate.save()
        userdata.posts.push(postcreate._id)
        await userdata.save()

        if (isMintNft) {
            return res.json({
                post: {
                    _id: postcreate._id,
                    description: postcreate.description,
                    imageUri: isimage ? result.secure_url : ""
                }
            })
        }

        return res.status(200).json({ success: "Post Successfully" })

    } catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Post Failed" });
    }
})

router.get("/like/:likeid", islogged, async (req, res) => {
    try {
        let likepost = await post.findOne({ _id: req.params.likeid })
        let userlike = await user.findOne({ email: req.datahere.email })

        if (likepost.likes.indexOf(userlike._id) === -1) {
            likepost.likes.push(userlike._id)

            await user.findByIdAndUpdate(userlike._id, {
                $addToSet: { interestedTags: { $each: likepost.tags } }
            })
            if (likepost.user.toString() !== userlike._id.toString()) {
                let alreadyLiked = await notify.findOne({
                    to: likepost.user,
                    from: userlike._id,
                    type: "like",
                    postid: likepost._id
                })
                if (!alreadyLiked) {
                    await notify.create({
                        to: likepost.user,
                        from: userlike._id,
                        type: "like",
                        postid: likepost._id
                    })
                }
            }
        }
        else {
            likepost.likes.splice(likepost.likes.indexOf(userlike._id), 1)
        }
        await likepost.save()
        res.json({ likes: likepost.likes.length })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

router.post("/send/:commentid", islogged, async (req, res) => {
    try {
        let commentpost = await post.findOne({ _id: req.params.commentid })
        if (req.body.comment) {
            commentpost.comments.push({ comment: req.body.comment, nameofuser: req.body.nameofuser, user: req.body.userid })
            await commentpost.save()
            const savedComment = commentpost.comments[commentpost.comments.length - 1]
            console.log(savedComment._id);
            
            res.json({success:true,cid:savedComment._id,comments: commentpost.comments.length})
        }
    } catch (error) {
       return res.json({success:false})
    }

})

router.post("/reply/:postid/:commentid",islogged,async (req,res)=>{
    try {
        let findpost = await post.findById(req.params.postid)
        let findcomment = findpost.comments.id(req.params.commentid)
        let userdata = await user.findOne({email:req.datahere.email})
        findcomment.replies.push({replier:userdata.username,reply:req.body.reply})
        await findpost.save() 
        res.status(200).json({success:true});  
    } catch (error) {
        return res.status(500).json({success:false})
    }
})

router.get("/profile/deletepost/:postid", islogged, async (req, res) => {
    let userdata = await user.findOneAndUpdate({ email: req.datahere.email }, { $pull: { posts: req.params.postid } })
    let findpost = await post.findByIdAndDelete({ _id: req.params.postid })
    let notifypostdelete = await notify.deleteMany({postid:req.params.postid})

    res.redirect("/profile")
})

router.post("/updatepost", async (req, res) => {
    try {
        let mypost = await post.findByIdAndUpdate(req.body.mypostid, { description: req.body.udescription })
        res.json({ success: true })
    } catch (error) {
        return res.json({ success: false })
    }
})

router.post("/view/:postid", islogged, async (req, res) => {
    let p = await post.findOne({ _id: req.params.postid })
    if (!p) {
        return res.status(404).json({ message: "User Not Found" })
    }
    let userdata = await user.findOne({ email: req.datahere.email })
    if (!p.views.includes(userdata._id.toString())) {
        p.views.push(userdata._id)
        await p.save()
    }
    res.json({ success: true })
})

export default router;