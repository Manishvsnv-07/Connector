import dotenv from "dotenv"
dotenv.config();
import express from "express"
import { user } from "./module/user.js"
import { post } from "./module/post.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import parser from "cookie-parser"
import multer from "multer"
import flash from "connect-flash"
import session from "express-session";
import { v2 as cloudinary } from "cloudinary";
import nacl from "tweetnacl"
import bs58 from "bs58"
import mongoose from "mongoose";

cloudinary.config({
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRETKEY,
    cloud_name: process.env.CLOUDINARY_NAME
})

const uploadToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        let resource = mimetype.startsWith("video/") ? "video" : "image";
        const stream = cloudinary.uploader.upload_stream({ resource_type: resource, folder: "postnow" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }
        );
        stream.end(buffer);
    });
};

const uploaddpToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: "image", folder: "postnow" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }
        );
        stream.end(buffer);
    });
};

const app = express()
const port = 57911

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
app.get("/", (req, res) => {
    if (req.cookies.token) {
        res.redirect("/profile")
    }
    else {
        let error = req.flash("error")
        res.render("index", { error });
    }
})

app.post("/create", (req, res) => {
    res.render("create")
})

app.post("/create/account", async (req, res) => {
    const { name, email, username, password } = req.body;
    let hash = await bcrypt.hash(req.body.password, 10)
    const createuser = new user({
        email,
        name,
        username,
        password: hash,
        image: "/images/default.png",
    })
    await createuser.save()
    let token = jwt.sign({ email }, process.env.JWT_KEY)
    res.cookie("token", token)
    res.redirect("/home")
})

app.get("/profile", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email }).populate("posts")
    res.render("profile", { userdata })
})

app.get('/image/:id', async (req, res) => {
    const postData = await post.findById(req.params.id);
    res.send(postData.image);
});

app.get("/home", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })
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
    res.render("home", { alluserspost, userdata });
})
app.get("/post", islogged, async (req, res) => {
    let success = req.flash("success")
    let error = req.flash("error")
    let undefined = req.flash("Undefined")
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("upload", { success, error, userdata, undefined });
})

app.get("/Vclips", islogged, async (req, res) => {
    let alluserspost = await post.find().populate("user").then(posts => posts.filter(post => post.user !== null));
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("vclips.ejs", { alluserspost, userdata });
})

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        // allowed types
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/mkv"];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // accept file
        } else {
            cb(new Error("Only images and videos are allowed"), false); // reject
        }
    }
});
app.post("/post", upload.single("media"), islogged, async (req, res) => {
    try {

        if(!req.file){
            req.flash("Undefined","Select Post First")
            return res.redirect("/post")
        }

        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype)
        const isimage = req.file.mimetype.startsWith("image/");
        const isvideo = req.file.mimetype.startsWith("video/");
        const { description } = req.body;
        let userdata = await user.findOne({ email: req.datahere.email })
        const postcreate = new post({
            user: userdata._id,
            description,
            tags: JSON.parse(req.body.tags || '[]'),
            image: isimage ? result.secure_url : "",
            videos: isvideo ? result.secure_url : ""
        })
        await postcreate.save()
        userdata.posts.push(postcreate._id)
        await userdata.save()
        req.flash("success", "Upload Success 🥳")
        res.redirect('/post')

    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.get("/logout", (req, res) => {
    res.cookie("token", "")
    res.redirect("/")
})
app.post("/logout", (req, res) => {
    res.redirect("/logout")
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let finduser = await user.findOne({ username: req.body.username })
    if (finduser) {
        let checkpassword = await bcrypt.compare(req.body.password, finduser.password)
        if (checkpassword) {
            let token = jwt.sign({ email: finduser.email }, process.env.JWT_KEY)
            res.cookie("token", token)
            res.redirect("/home");
        }
        else {
            req.flash("error", "Email Or Password Is Wrong");
            res.redirect("/");
        }
    }
    else {
        req.flash("error", "Email Or Password Is Wrong");
        res.redirect("/")
    }
})

function islogged(req, res, next) {
    if (req.cookies.token === "") {
        res.redirect("/");
    }
    else {
        let verify = jwt.verify(req.cookies.token, process.env.JWT_KEY)
        req.datahere = verify;
        next()
    }
}


app.post("/follow", islogged, async (req, res) => {
    let mydata = await user.findOne({ email: req.datahere.email })
    let otheruserdata = await user.findOne({ _id: req.body.followeduser });
    if (otheruserdata.follower.includes(mydata._id)) {
        otheruserdata.follower.splice(otheruserdata.follower.indexOf(mydata._id), 1)
        mydata.following.splice(mydata.following.indexOf(otheruserdata._id), 1)
        await otheruserdata.save()
        await mydata.save()
        return res.json({ following: false })
    }
    otheruserdata.follower.push(mydata._id);
    mydata.following.push(otheruserdata._id)
    await otheruserdata.save()
    await mydata.save()
    return res.json({ following: true })
})

app.post("/update", upload.single("dp"), islogged, async (req, res) => {
    let userdata = await user.findOne({ username: req.datahere.username })
    const { updescription, upname, upusername } = req.body;
    let updatedata = {};
    if (req.body.upname) {
        updatedata.name = upname;
    }
    if (req.body.updescription) {
        updatedata.bio = updescription;
    }
    if (req.body.upusername) {
        updatedata.username = upusername;
    }
    let image_url = null
    if (req.file) {
        const result = await uploaddpToCloudinary(req.file.buffer)
        image_url = result.secure_url;
    }
    else {
        image_url = "image/default.png"
    }
    if (req.file) {
        updatedata.image = image_url;
    }
    let update = await user.findOneAndUpdate(
        { email: req.datahere.email },
        updatedata,
        { new: true }
    )
    res.redirect("/profile")

})


app.get("/profiles/edit", islogged, async (req, res) => {
    let error = req.flash("error")
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("profileedit", { error, userdata })
})

app.get("/like/:likeid", islogged, async (req, res) => {
    try {
        let likepost = await post.findOne({ _id: req.params.likeid })
        let userlike = await user.findOne({ email: req.datahere.email })

        if (likepost.likes.indexOf(userlike._id) === -1) {
            likepost.likes.push(userlike._id)

            await user.findByIdAndUpdate(userlike._id, {
                $addToSet: { interestedTags: { $each: likepost.tags } }
            })
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

app.post("/send/:commentid", islogged, async (req, res) => {
    let commentpost = await post.findOne({ _id: req.params.commentid })
    if (req.body.comment) {
        commentpost.comments.push({ comment: req.body.comment, nameofuser: req.body.nameofuser })
        await commentpost.save()
    }
    res.json({ comments: commentpost.comments.length })
})

app.post("/commentbox/:id", (req, res) => {
    res.send("hello")
})


app.get("/profile/viewpost/:postid", islogged, async (req, res) => {
    let myposts = await post.findOne({ _id: req.params.postid }).populate("user")
    let userdata = await user.findOne({ email: req.datahere.email })
    res.render("yourposts", { myposts, userdata })
})

app.get("/profile/deletepost/:postid", islogged, async (req, res) => {
    let userdata = await user.findOneAndUpdate({ email: req.datahere.email }, { $pull: { posts: req.params.postid } })
    let findpost = await post.findByIdAndDelete({ _id: req.params.postid })
    res.redirect("/profile")
})

app.post("/profile/Connectphantom", islogged, async (req, res) => {
    try {
        const { publicKey, signature, message } = req.body;

        // 1. Verify signature
        const isValid = nacl.sign.detached.verify(
            new TextEncoder().encode(message),
            new Uint8Array(signature),
            bs58.decode(publicKey)
        );

        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid signature" });
        }

        // 2. Save wallet in DB
        let userdata = await user.findOne({ email: req.datahere.email });

        if (!userdata) {
            return res.status(404).json({ message: "User not found" });
        }

        userdata.walletAddress = publicKey;
        await userdata.save();

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/auth/message", (req, res) => {
    const message = `Let's Connect With Our Platform At ${Date.now()}`;
    res.json({ message })
})

app.get("/profile/Disconnectphantom", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })
    userdata.walletAddress = undefined;
    await userdata.save()
    res.redirect("/profile")
})


app.get("/home/:id", islogged, async (req, res) => {
    let userdata = await user.findOne({ _id: req.params.id }).populate("posts")
    let mydata = await user.findOne({ email: req.datahere.email })
    if (req.params.id == mydata._id) {
        return res.redirect("/profile")
    }
    res.render("otheruserprofile.ejs", { userdata })
})


app.get("/Search", islogged, async (req, res) => {
    let userdata = await user.findOne({ email: req.datahere.email })

    res.render("search", { userdata })
})
app.get("/search/user", async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === "") {
        return res.json([])
    }

    const finduser = await user.find({
        username: { $regex: new RegExp(query, 'i') }
    }).select('username image _id').limit(8)

    res.json(finduser)
})

app.get("/Search/:id", islogged, async (req, res) => {
    let userdata = await user.findOne({ _id: req.params.id })
    let mydata = await user.findOne({ email: req.datahere.email })
    if (userdata._id.toString() === mydata._id.toString()) {
        return res.redirect("/profile")
    }
    res.render("searcheduser", { userdata })
})

app.post("/view/:postid", islogged, async (req, res) => {
    let p = await post.findOne({ _id: req.params.postid })
    let userdata = await user.findOne({ email: req.datahere.email })
    if (p.views.includes(userdata._id.toString())) {

    }
    else {
        p.views.push(userdata._id)
        await p.save()
    }
})

app.get("/mobilestart",(req,res)=>{
    res.render("mobileindex")
})

app.listen(port, () => {
    console.log(`my port at ${port}`);
})